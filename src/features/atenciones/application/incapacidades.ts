import type { Prisma } from '@prisma/client';

import { dateInTimeZone, parseDateOnly } from '@/features/agenda/domain/date-time';
import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { ReceptionError } from '@/features/reception/application/errors';
import type { AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import {
  fechaFinIncapacidad,
  formatNumeroInterno,
  validarProrroga,
  type CreateIncapacidadCommand,
  type Incapacidad,
} from '../domain/incapacidades';
import { editableCita } from './editable-cita';

type Db = Prisma.TransactionClient | typeof prisma;

const HISTORY_LIMIT = 50;
/** Serializa la numeración: dos incapacidades simultáneas no toman el mismo consecutivo. */
const NUMERACION_LOCK_KEY = 7_031_001;

const INCAPACIDAD_SELECT = {
  id: true,
  citaId: true,
  numeroInterno: true,
  categoria: true,
  prorroga: true,
  prorrogaDe: { select: { id: true, numeroInterno: true } },
  prorrogaExternaNumero: true,
  prorrogaExternaFin: true,
  cita: { select: { diagnosticos: { orderBy: { orden: 'asc' }, select: { cie10: { select: { codigo: true, nombre: true } } } } } },
  fechaInicio: true,
  fechaFin: true,
  dias: true,
  observaciones: true,
  createdAt: true,
  createdBy: true,
} satisfies Prisma.AtencionIncapacidadSelect;

type IncapacidadRow = Prisma.AtencionIncapacidadGetPayload<{ select: typeof INCAPACIDAD_SELECT }>;

const dateOnly = (value: Date) => value.toISOString().slice(0, 10);

async function toIncapacidades(db: Db, rows: IncapacidadRow[]): Promise<Incapacidad[]> {
  const empleados = await db.empleado.findMany({
    where: { id: { in: [...new Set(rows.map((row) => row.createdBy))] } },
    select: { id: true, primerNombre: true, segundoNombre: true, primerApellido: true, segundoApellido: true },
  });
  return rows.map((row) => {
    const empleado = empleados.find((item) => item.id === row.createdBy);
    return {
      id: row.id,
      citaId: row.citaId,
      numeroInterno: row.numeroInterno,
      categoria: row.categoria,
      prorroga: row.prorroga,
      prorrogaDe: row.prorrogaDe,
      prorrogaExterna:
        row.prorrogaExternaNumero && row.prorrogaExternaFin
          ? { numero: row.prorrogaExternaNumero, fechaFin: dateOnly(row.prorrogaExternaFin) }
          : null,
      diagnosticos: row.cita.diagnosticos.map((item) => item.cie10),
      fechaInicio: dateOnly(row.fechaInicio),
      fechaFin: dateOnly(row.fechaFin),
      dias: row.dias,
      observaciones: row.observaciones,
      fecha: row.createdAt.toISOString(),
      medicoNombre: empleado ? employeeFullName(empleado) : null,
    };
  });
}

/** Incapacidades de la atención, historial del docente y total de días que lleva incapacitado. */
export async function getIncapacidades(citaId: number, usuarioId: number) {
  const [actuales, historial, total] = await Promise.all([
    prisma.atencionIncapacidad.findMany({ where: { citaId }, orderBy: { id: 'asc' }, select: INCAPACIDAD_SELECT }),
    prisma.atencionIncapacidad.findMany({
      where: { usuarioId, citaId: { not: citaId } },
      orderBy: { fechaInicio: 'desc' },
      take: HISTORY_LIMIT,
      select: INCAPACIDAD_SELECT,
    }),
    prisma.atencionIncapacidad.aggregate({ where: { usuarioId }, _sum: { dias: true } }),
  ]);
  return {
    incapacidades: await toIncapacidades(prisma, actuales),
    historial: await toIncapacidades(prisma, historial),
    diasAcumulados: total._sum.dias ?? 0,
  };
}

async function siguienteNumeroInterno(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${NUMERACION_LOCK_KEY})`;
  const anio = Number(dateInTimeZone(new Date(), 'America/Bogota').slice(0, 4));
  const ultimo = await tx.atencionIncapacidad.findFirst({
    where: { numeroInterno: { startsWith: `${anio}-` } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { numeroInterno: true },
  });
  const consecutivo = ultimo ? Number(ultimo.numeroInterno.split('-')[1]) + 1 : 1;
  return formatNumeroInterno(anio, consecutivo);
}

export async function createIncapacidad(auth: AuthorizationContext, citaId: number, input: CreateIncapacidadCommand) {
  return prisma.$transaction(async (tx) => {
    const cita = await editableCita(tx, auth, citaId);
    // La incapacidad lleva todos los diagnósticos de la atención.
    const diagnosticos = await tx.atencionDiagnostico.count({ where: { citaId } });
    if (diagnosticos === 0) {
      throw new ReceptionError('DIAGNOSTICO_REQUERIDO', 'Registra primero los diagnósticos de la atención.', 422);
    }

    const fechaFin = fechaFinIncapacidad(input.fechaInicio, input.dias);
    if (input.prorrogaDeId) {
      const anterior = await tx.atencionIncapacidad.findFirst({
        where: { id: input.prorrogaDeId, usuarioId: cita.usuarioId },
        select: { fechaFin: true },
      });
      if (!anterior) throw new ReceptionError('NOT_FOUND', 'La incapacidad que se prorroga no existe.', 404);
      const motivo = validarProrroga(dateOnly(anterior.fechaFin), input.fechaInicio);
      if (motivo) throw new ReceptionError('PRORROGA_INVALIDA', motivo, 422);
    }
    if (input.prorrogaExterna) {
      const motivo = validarProrroga(input.prorrogaExterna.fechaFin, input.fechaInicio);
      if (motivo) throw new ReceptionError('PRORROGA_INVALIDA', motivo, 422);
    }

    // El lock de numeración también serializa esta verificación de cruces.
    const numeroInterno = await siguienteNumeroInterno(tx);
    const cruce = await tx.atencionIncapacidad.findFirst({
      where: {
        usuarioId: cita.usuarioId,
        fechaInicio: { lte: parseDateOnly(fechaFin) },
        fechaFin: { gte: parseDateOnly(input.fechaInicio) },
      },
      select: { numeroInterno: true },
    });
    if (cruce) {
      throw new ReceptionError(
        'INCAPACIDAD_CRUZADA',
        `Las fechas se cruzan con la incapacidad ${cruce.numeroInterno} del docente.`,
        409,
      );
    }

    const created = await tx.atencionIncapacidad.create({
      data: {
        citaId,
        usuarioId: cita.usuarioId,
        numeroInterno,
        categoria: input.categoria,
        prorroga: input.prorroga,
        prorrogaDeId: input.prorrogaDeId ?? null,
        prorrogaExternaNumero: input.prorrogaExterna?.numero ?? null,
        prorrogaExternaFin: input.prorrogaExterna ? parseDateOnly(input.prorrogaExterna.fechaFin) : null,
        fechaInicio: parseDateOnly(input.fechaInicio),
        fechaFin: parseDateOnly(fechaFin),
        dias: input.dias,
        observaciones: input.observaciones || null,
        createdBy: auth.empleadoId,
      },
      select: INCAPACIDAD_SELECT,
    });
    return (await toIncapacidades(tx, [created]))[0];
  });
}

/** Solo quien la expidió puede quitarla, con la atención abierta y si nadie la prorroga. */
export async function deleteIncapacidad(auth: AuthorizationContext, citaId: number, incapacidadId: number) {
  return prisma.$transaction(async (tx) => {
    await editableCita(tx, auth, citaId);
    const prorrogas = await tx.atencionIncapacidad.count({ where: { prorrogaDeId: incapacidadId } });
    if (prorrogas > 0) {
      throw new ReceptionError('INCAPACIDAD_PRORROGADA', 'No se puede quitar: otra incapacidad la prorroga.', 409);
    }
    const deleted = await tx.atencionIncapacidad.deleteMany({
      where: { id: incapacidadId, citaId, createdBy: auth.empleadoId },
    });
    if (deleted.count === 0) throw new ReceptionError('NOT_FOUND', 'La incapacidad ya no existe.', 404);
    return { id: incapacidadId };
  });
}
