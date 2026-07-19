import { Prisma } from '@prisma/client';

import { timeFromDatabase } from '@/features/agenda/domain/date-time';
import { AgendaApplicationError } from '@/features/agenda/application/agenda-service';
import { listSchedulableDoctors } from '@/features/agenda/infrastructure/schedulable-doctors';
import { prisma } from '@/lib/prisma';

export type WorkScheduleCommand = {
  sedeId: number;
  medicoId?: number | null;
  nombre: string;
  zonaHoraria: string;
  bloques: Array<{
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    orden?: number;
  }>;
};

function databaseTime(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

async function assertScheduleScope(command: WorkScheduleCommand, excludeId?: number) {
  const sede = await prisma.sede.findFirst({ where: { id: command.sedeId, estado: 1 }, select: { id: true } });
  if (!sede) throw new AgendaApplicationError('La sede no está activa.', 404);

  if (command.medicoId) {
    const doctors = await listSchedulableDoctors({
      sedeId: command.sedeId,
      medicoIds: [command.medicoId],
      limit: 1,
    });
    if (doctors.length !== 1) {
      throw new AgendaApplicationError('El médico no está activo o pertenece a otra sede.');
    }
  }

  const activeSchedule = await prisma.horarioLaboral.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      activo: true,
      sedeId: command.sedeId,
      medicoId: command.medicoId ?? null,
    },
    select: { id: true, nombre: true },
  });
  if (activeSchedule) {
    throw new AgendaApplicationError(
      `Ya existe un horario activo para este alcance: “${activeSchedule.nombre}”. Edítalo o desactívalo.`,
      409,
    );
  }
}

function scheduleData(command: WorkScheduleCommand, actor: string) {
  return {
    sedeId: command.sedeId,
    medicoId: command.medicoId ?? null,
    nombre: command.nombre,
    zonaHoraria: command.zonaHoraria,
    updatedBy: actor,
  };
}

export async function createWorkSchedule(command: WorkScheduleCommand, actor: string) {
  await assertScheduleScope(command);
  return prisma.horarioLaboral.create({
    data: {
      ...scheduleData(command, actor),
      createdBy: actor,
      bloques: {
        create: command.bloques.map((block, index) => ({
          diaSemana: block.diaSemana,
          horaInicio: databaseTime(block.horaInicio),
          horaFin: databaseTime(block.horaFin),
          orden: block.orden ?? index + 1,
        })),
      },
    },
    select: { id: true },
  });
}

export async function updateWorkSchedule(id: number, command: WorkScheduleCommand, actor: string) {
  const existing = await prisma.horarioLaboral.findUnique({ where: { id }, select: { id: true, activo: true } });
  if (!existing) throw new AgendaApplicationError('Horario no encontrado.', 404);
  if (!existing.activo) throw new AgendaApplicationError('Un horario inactivo no puede modificarse.', 409);
  await assertScheduleScope(command, id);

  return prisma.$transaction(async (tx) => {
    await tx.horarioLaboralBloque.deleteMany({ where: { horarioLaboralId: id } });
    return tx.horarioLaboral.update({
      where: { id },
      data: {
        ...scheduleData(command, actor),
        bloques: {
          create: command.bloques.map((block, index) => ({
            diaSemana: block.diaSemana,
            horaInicio: databaseTime(block.horaInicio),
            horaFin: databaseTime(block.horaFin),
            orden: block.orden ?? index + 1,
          })),
        },
      },
      select: { id: true },
    });
  });
}

export async function deactivateWorkSchedule(id: number, actor: string) {
  const result = await prisma.horarioLaboral.updateMany({
    where: { id, activo: true },
    data: { activo: false, updatedBy: actor },
  });
  if (result.count === 0) throw new AgendaApplicationError('Horario no encontrado o ya inactivo.', 404);
}

export async function listWorkSchedules(filters: { sedeId: number; medicoId?: number | null; includeInactive?: boolean }) {
  const rows = await prisma.horarioLaboral.findMany({
    where: {
      sedeId: filters.sedeId,
      ...(filters.medicoId !== undefined ? { medicoId: filters.medicoId } : {}),
      ...(!filters.includeInactive ? { activo: true } : {}),
    },
    include: {
      sede: { select: { nombre: true } },
      medico: {
        select: {
          primerNombre: true,
          segundoNombre: true,
          primerApellido: true,
          segundoApellido: true,
        },
      },
      bloques: { orderBy: [{ diaSemana: 'asc' }, { orden: 'asc' }] },
      _count: { select: { generaciones: true } },
    },
    orderBy: [{ activo: 'desc' }, { updatedAt: 'desc' }, { id: 'desc' }],
  });

  return rows.map((row) => ({
    id: row.id,
    sedeId: row.sedeId,
    sedeNombre: row.sede.nombre,
    medicoId: row.medicoId,
    medicoNombre: row.medico
      ? [row.medico.primerNombre, row.medico.segundoNombre, row.medico.primerApellido, row.medico.segundoApellido]
          .filter(Boolean)
          .join(' ')
      : null,
    alcance: row.medicoId ? 'PARTICULAR' : 'SEDE',
    nombre: row.nombre,
    zonaHoraria: row.zonaHoraria,
    activo: row.activo,
    utilizado: row._count.generaciones > 0,
    bloques: row.bloques.map((block) => ({
      id: block.id,
      diaSemana: block.diaSemana,
      horaInicio: timeFromDatabase(block.horaInicio),
      horaFin: timeFromDatabase(block.horaFin),
      orden: block.orden,
    })),
  }));
}

export function isDatabaseConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ['P2002', 'P2003', 'P2010'].includes(error.code)
  );
}
