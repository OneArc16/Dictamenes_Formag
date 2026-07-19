import { createHash } from 'node:crypto';

import { Prisma, type PrismaClient } from '@prisma/client';

import {
  broadUtcRange,
  dateInTimeZone,
  differenceInCalendarDays,
  eachDateInclusive,
  isoDayOfWeek,
  parseDateOnly,
  timeFromDatabase,
} from '@/features/agenda/domain/date-time';
import { generateSlotCandidates, intervalsOverlap } from '@/features/agenda/domain/slot-engine';
import type {
  AgendaGenerationInput,
  AgendaPreview,
  AgendaPreviewDoctor,
  SlotCandidate,
} from '@/features/agenda/domain/types';
import { listSchedulableDoctors } from '@/features/agenda/infrastructure/schedulable-doctors';
import { prisma } from '@/lib/prisma';

type AgendaDatabase = Pick<PrismaClient, 'sede' | 'empleado' | 'horarioLaboral' | 'cupoMedico'>;

type ScheduleRow = Prisma.HorarioLaboralGetPayload<{
  include: { bloques: true };
}>;

type ExistingSlot = {
  id: number;
  medicoId: number;
  inicio: Date;
  fin: Date;
};

type DoctorCalculation = {
  medicoId: number;
  medicoNombre: string;
  scheduleId: number | null;
  candidates: SlotCandidate[];
  newSlots: SlotCandidate[];
  omitted: number;
  conflicts: number;
  preview: AgendaPreviewDoctor;
};

export type AgendaCalculation = {
  preview: AgendaPreview;
  doctors: DoctorCalculation[];
};

export class AgendaApplicationError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = 'AgendaApplicationError';
  }
}

function scheduleApplies(schedule: ScheduleRow, date: string) {
  const from = schedule.vigenteDesde.toISOString().slice(0, 10);
  const to = schedule.vigenteHasta?.toISOString().slice(0, 10) ?? null;
  return schedule.activo && from <= date && (!to || to >= date);
}

function resolveEffectiveSchedule(
  schedules: ScheduleRow[],
  medicoId: number,
  date: string,
): { schedule: ScheduleRow | null; error: string | null } {
  const particular = schedules.filter(
    (schedule) => schedule.medicoId === medicoId && scheduleApplies(schedule, date),
  );
  if (particular.length > 1) {
    return { schedule: null, error: `Hay más de un horario particular vigente para ${date}.` };
  }
  if (particular[0]) return { schedule: particular[0], error: null };

  const site = schedules.filter(
    (schedule) => schedule.medicoId === null && scheduleApplies(schedule, date),
  );
  if (site.length > 1) {
    return { schedule: null, error: `Hay más de un horario de sede vigente para ${date}.` };
  }
  return { schedule: site[0] ?? null, error: null };
}

function normalizeGenerationInput(input: AgendaGenerationInput): AgendaGenerationInput {
  const medicoIds = [...new Set(input.medicoIds)].sort((a, b) => a - b);
  const globalDates = [...new Set(input.fechasExcluidas)].sort();
  const byDoctor = new Map<number, Set<string>>();
  for (const exclusion of input.exclusionesPorMedico) {
    const dates = byDoctor.get(exclusion.medicoId) ?? new Set<string>();
    exclusion.fechas.forEach((date) => dates.add(date));
    byDoctor.set(exclusion.medicoId, dates);
  }
  return {
    sedeId: input.sedeId,
    medicoIds,
    fechaInicial: input.fechaInicial,
    fechaFinal: input.fechaFinal,
    duracionMinutos: input.duracionMinutos,
    fechasExcluidas: globalDates,
    exclusionesPorMedico: [...byDoctor.entries()]
      .sort(([left], [right]) => left - right)
      .map(([medicoId, dates]) => ({ medicoId, fechas: [...dates].sort() })),
  };
}

function createFingerprint(input: AgendaGenerationInput, scheduleVersions: string[]) {
  return createHash('sha256')
    .update(JSON.stringify({ input: normalizeGenerationInput(input), scheduleVersions: [...scheduleVersions].sort() }))
    .digest('hex');
}

function classifyCandidates(candidates: SlotCandidate[], existing: ExistingSlot[], now: Date) {
  const newSlots: SlotCandidate[] = [];
  let omitted = 0;
  let conflicts = 0;

  for (const candidate of candidates) {
    if (candidate.inicio <= now) {
      omitted += 1;
      continue;
    }

    const doctorSlots = existing.filter((slot) => slot.medicoId === candidate.medicoId);
    const exact = doctorSlots.some(
      (slot) => slot.inicio.getTime() === candidate.inicio.getTime() && slot.fin.getTime() === candidate.fin.getTime(),
    );
    if (exact) {
      omitted += 1;
      continue;
    }

    if (doctorSlots.some((slot) => intervalsOverlap(candidate, slot))) {
      conflicts += 1;
      continue;
    }

    newSlots.push(candidate);
  }

  return { newSlots, omitted, conflicts };
}

function assertGenerationRange(input: AgendaGenerationInput, now: Date) {
  const days = differenceInCalendarDays(input.fechaInicial, input.fechaFinal);
  if (days < 0 || days > 89) {
    throw new AgendaApplicationError('El rango debe estar entre 1 y 90 días naturales.');
  }
  const today = dateInTimeZone(now, 'America/Bogota');
  if (input.fechaInicial < today) {
    throw new AgendaApplicationError('La fecha inicial debe ser hoy o una fecha futura.');
  }

  const allDates = new Set(eachDateInclusive(input.fechaInicial, input.fechaFinal));
  const invalidExclusion = [
    ...input.fechasExcluidas,
    ...input.exclusionesPorMedico.flatMap((item) => item.fechas),
  ].find((date) => !allDates.has(date));
  if (invalidExclusion) {
    throw new AgendaApplicationError(`La fecha excluida ${invalidExclusion} está fuera del periodo.`);
  }
}

export async function calculateAgenda(
  rawInput: AgendaGenerationInput,
  db: AgendaDatabase = prisma,
  now = new Date(),
): Promise<AgendaCalculation> {
  const input = normalizeGenerationInput(rawInput);
  assertGenerationRange(input, now);

  const sede = await db.sede.findFirst({
    where: { id: input.sedeId, estado: 1 },
    select: { id: true, nombre: true },
  });
  if (!sede) throw new AgendaApplicationError('La sede seleccionada no está activa.', 404);

  const doctors = await listSchedulableDoctors(
    { sedeId: input.sedeId, medicoIds: input.medicoIds, limit: 50 },
    db,
  );
  const doctorsById = new Map(doctors.map((doctor) => [doctor.id, doctor]));
  const missing = input.medicoIds.filter((id) => !doctorsById.has(id));
  if (missing.length > 0) {
    throw new AgendaApplicationError('Uno o más médicos ya no están activos o no pertenecen a la sede.');
  }

  const schedules = await db.horarioLaboral.findMany({
    where: {
      sedeId: input.sedeId,
      activo: true,
      vigenteDesde: { lte: parseDateOnly(input.fechaFinal) },
      OR: [
        { vigenteHasta: null },
        { vigenteHasta: { gte: parseDateOnly(input.fechaInicial) } },
      ],
      AND: [{ OR: [{ medicoId: null }, { medicoId: { in: input.medicoIds } }] }],
    },
    include: { bloques: { orderBy: [{ diaSemana: 'asc' }, { orden: 'asc' }] } },
    orderBy: [{ medicoId: 'desc' }, { vigenteDesde: 'asc' }],
  });

  const { from, to } = broadUtcRange(input.fechaInicial, input.fechaFinal);
  const existing = await db.cupoMedico.findMany({
    where: {
      medicoId: { in: input.medicoIds },
      estado: { not: 'CANCELADO' },
      inicio: { lt: to },
      fin: { gt: from },
    },
    select: { id: true, medicoId: true, inicio: true, fin: true },
  });

  const globalExclusions = new Set(input.fechasExcluidas);
  const exclusionsByDoctor = new Map(
    input.exclusionesPorMedico.map((item) => [item.medicoId, new Set(item.fechas)]),
  );
  const dates = eachDateInclusive(input.fechaInicial, input.fechaFinal);
  const scheduleVersions = new Set<string>();
  const evaluatedWorkDates = new Set<string>();
  const errors = new Set<string>();
  const doctorCalculations: DoctorCalculation[] = [];

  for (const medicoId of input.medicoIds) {
    const doctor = doctorsById.get(medicoId)!;
    const doctorErrors = new Set<string>();
    const candidates: SlotCandidate[] = [];
    const usedSchedules = new Map<number, ScheduleRow>();
    const doctorWorkDates = new Set<string>();
    let excludedDates = 0;

    for (const date of dates) {
      const resolved = resolveEffectiveSchedule(schedules, medicoId, date);
      if (resolved.error) {
        doctorErrors.add(resolved.error);
        continue;
      }
      if (!resolved.schedule) {
        doctorErrors.add('No existe un horario laboral efectivo para todo el periodo.');
        continue;
      }

      const schedule = resolved.schedule;
      usedSchedules.set(schedule.id, schedule);
      scheduleVersions.add(`${schedule.id}:${schedule.updatedAt.toISOString()}`);
      const blocks = schedule.bloques.map((block) => ({
        diaSemana: block.diaSemana,
        horaInicio: timeFromDatabase(block.horaInicio),
        horaFin: timeFromDatabase(block.horaFin),
      }));
      if (!blocks.some((block) => block.diaSemana === isoDayOfWeek(date))) continue;
      doctorWorkDates.add(date);
      evaluatedWorkDates.add(date);

      if (globalExclusions.has(date) || exclusionsByDoctor.get(medicoId)?.has(date)) {
        excludedDates += 1;
        continue;
      }

      candidates.push(
        ...generateSlotCandidates({
          medicoId,
          sedeId: input.sedeId,
          horarioLaboralId: schedule.id,
          fecha: date,
          zonaHoraria: schedule.zonaHoraria,
          duracionMinutos: input.duracionMinutos,
          bloques: blocks,
        }),
      );
    }

    if (candidates.length > 25_000) {
      doctorErrors.add('La cantidad de cupos excede el límite operativo de 25.000. Divide la generación.');
    }
    const classification = classifyCandidates(candidates, existing, now);
    const uniqueSchedules = [...usedSchedules.values()];
    const primarySchedule = uniqueSchedules[0] ?? null;
    const names = uniqueSchedules.map((schedule) => schedule.nombre);
    const origins = new Set(uniqueSchedules.map((schedule) => (schedule.medicoId ? 'PARTICULAR' : 'SEDE')));

    doctorErrors.forEach((message) => errors.add(`${doctor.nombre}: ${message}`));
    doctorCalculations.push({
      medicoId,
      medicoNombre: doctor.nombre,
      scheduleId: primarySchedule?.id ?? null,
      candidates,
      newSlots: classification.newSlots,
      omitted: classification.omitted,
      conflicts: classification.conflicts,
      preview: {
        medicoId,
        medicoNombre: doctor.nombre,
        horarioLaboralId: primarySchedule?.id ?? null,
        horarioLaboralNombre: names.length > 0 ? [...new Set(names)].join(' / ') : null,
        horarioOrigen: origins.size === 1 ? ([...origins][0] as 'SEDE' | 'PARTICULAR') : null,
        fechasLaborales: doctorWorkDates.size,
        fechasLaboralesLista: [...doctorWorkDates].sort(),
        fechasExcluidas: excludedDates,
        totalCandidatos: candidates.length,
        totalNuevos: classification.newSlots.length,
        totalOmitidos: classification.omitted,
        totalConflictos: classification.conflicts,
        errores: [...doctorErrors],
      },
    });
  }

  const totalCandidates = doctorCalculations.reduce((sum, item) => sum + item.candidates.length, 0);
  if (totalCandidates > 25_000) errors.add('La operación supera 25.000 candidatos. Divide el periodo o los médicos.');
  const totalConflicts = doctorCalculations.reduce((sum, item) => sum + item.conflicts, 0);
  if (totalConflicts > 0) errors.add('Existen cupos superpuestos con otra duración. Ajusta el periodo o cancela la disponibilidad previa.');
  const zone = schedules[0]?.zonaHoraria ?? 'America/Bogota';

  const preview: AgendaPreview = {
    fingerprint: createFingerprint(input, [...scheduleVersions]),
    sedeId: sede.id,
    sedeNombre: sede.nombre,
    fechaInicial: input.fechaInicial,
    fechaFinal: input.fechaFinal,
    duracionMinutos: input.duracionMinutos,
    zonaHoraria: zone,
    totalMedicos: input.medicoIds.length,
    totalCandidatos: totalCandidates,
    totalNuevos: doctorCalculations.reduce((sum, item) => sum + item.newSlots.length, 0),
    totalOmitidos: doctorCalculations.reduce((sum, item) => sum + item.omitted, 0),
    totalConflictos: totalConflicts,
    fechasLaboralesEvaluadas: [...evaluatedWorkDates].sort(),
    bloqueado: errors.size > 0,
    errores: [...errors],
    medicos: doctorCalculations.map((item) => item.preview),
  };

  return { preview, doctors: doctorCalculations };
}

function generationResult(generation: {
  id: number;
  estado: string;
  totalMedicos: number;
  totalCandidatos: number;
  totalCreados: number;
  totalOmitidos: number;
  totalConflictos: number;
}) {
  return {
    generacionId: generation.id,
    estado: generation.estado,
    totalMedicos: generation.totalMedicos,
    totalCandidatos: generation.totalCandidatos,
    totalCreados: generation.totalCreados,
    totalOmitidos: generation.totalOmitidos,
    totalConflictos: generation.totalConflictos,
  };
}

export async function confirmAgendaGeneration(
  input: AgendaGenerationInput & { idempotencyKey: string; previewFingerprint?: string },
  actor: string,
) {
  const existingGeneration = await prisma.generacionAgenda.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existingGeneration) return generationResult(existingGeneration);

  const normalized = normalizeGenerationInput(input);
  const execute = () =>
    prisma.$transaction(
      async (tx) => {
        for (const medicoId of normalized.medicoIds) {
          await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(481516, ${medicoId}::int)`;
        }

        const calculation = await calculateAgenda(normalized, tx);
        if (calculation.preview.bloqueado) {
          throw new AgendaApplicationError(calculation.preview.errores[0] ?? 'La agenda tiene conflictos.', 409);
        }
        if (input.previewFingerprint && input.previewFingerprint !== calculation.preview.fingerprint) {
          throw new AgendaApplicationError('La configuración cambió desde la vista previa. Revísala nuevamente.', 409);
        }

        const totalOmitted = calculation.preview.totalOmitidos;
        const generation = await tx.generacionAgenda.create({
          data: {
            sedeId: normalized.sedeId,
            fechaInicial: parseDateOnly(normalized.fechaInicial),
            fechaFinal: parseDateOnly(normalized.fechaFinal),
            duracionMinutos: normalized.duracionMinutos,
            zonaHoraria: calculation.preview.zonaHoraria,
            estado: totalOmitted > 0 ? 'COMPLETADA_CON_OMISIONES' : 'COMPLETADA',
            idempotencyKey: input.idempotencyKey,
            totalMedicos: calculation.preview.totalMedicos,
            totalCandidatos: calculation.preview.totalCandidatos,
            totalCreados: calculation.preview.totalNuevos,
            totalOmitidos: totalOmitted,
            totalConflictos: calculation.preview.totalConflictos,
            completedAt: new Date(),
            createdBy: actor,
          },
        });

        await tx.generacionAgendaMedico.createMany({
          data: calculation.doctors.map((doctor) => {
            if (!doctor.scheduleId) throw new AgendaApplicationError('No se pudo resolver el horario efectivo.', 409);
            return {
              generacionAgendaId: generation.id,
              medicoId: doctor.medicoId,
              horarioLaboralId: doctor.scheduleId,
              totalCandidatos: doctor.candidates.length,
              totalCreados: doctor.newSlots.length,
              totalOmitidos: doctor.omitted,
              totalConflictos: doctor.conflicts,
            };
          }),
        });

        const exclusions = [
          ...normalized.fechasExcluidas.map((fecha) => ({
            generacionAgendaId: generation.id,
            medicoId: null,
            fecha: parseDateOnly(fecha),
          })),
          ...normalized.exclusionesPorMedico.flatMap((item) =>
            item.fechas.map((fecha) => ({
              generacionAgendaId: generation.id,
              medicoId: item.medicoId,
              fecha: parseDateOnly(fecha),
            })),
          ),
        ];
        if (exclusions.length > 0) {
          await tx.generacionAgendaFechaExcluida.createMany({ data: exclusions });
        }

        const slots = calculation.doctors.flatMap((doctor) => doctor.newSlots);
        if (slots.length > 0) {
          await tx.cupoMedico.createMany({
            data: slots.map((slot) => ({
              generacionAgendaId: generation.id,
              medicoId: slot.medicoId,
              sedeId: slot.sedeId,
              inicio: slot.inicio,
              fin: slot.fin,
              duracionMinutos: slot.duracionMinutos,
              estado: 'DISPONIBLE',
              createdBy: actor,
            })),
          });
        }

        return generationResult(generation);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30_000 },
    );

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await execute();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const repeated = await prisma.generacionAgenda.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
        if (repeated) return generationResult(repeated);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt === 0) continue;
      throw error;
    }
  }

  throw new AgendaApplicationError('No fue posible completar la generación por concurrencia.', 409);
}
