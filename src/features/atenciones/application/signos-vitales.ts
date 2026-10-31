import type { Prisma } from '@prisma/client';

import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { ReceptionError } from '@/features/reception/application/errors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import { EMPTY_SIGNOS, SIGNO_SELECT, signosFromRecord, type SignosValues } from '../domain/signos-vitales';
import { attendBlocker } from './attend-blocker';

const HISTORY_LIMIT = 20;

export type SignosVitalesToma = {
  values: SignosValues;
  tomadoEn: string | null;
  tomadoPor: string | null;
};

export type SignosHistorialItem = {
  citaId: number;
  fecha: string;
  medicoNombre: string;
  values: SignosValues;
};

type Db = Prisma.TransactionClient | typeof prisma;

async function employeeName(db: Db, id: number) {
  const empleado = await db.empleado.findUnique({
    where: { id },
    select: { primerNombre: true, segundoNombre: true, primerApellido: true, segundoApellido: true },
  });
  return empleado ? employeeFullName(empleado) : null;
}

/** Toma de esta atención (vacía si aún no se registra) e historial de las demás atenciones del docente. */
export async function getSignosVitales(citaId: number, usuarioId: number) {
  const [actual, historial] = await Promise.all([
    prisma.signosVitales.findUnique({
      where: { citaId },
      select: { ...SIGNO_SELECT, updatedAt: true, updatedBy: true },
    }),
    prisma.signosVitales.findMany({
      where: { usuarioId, citaId: { not: citaId } },
      orderBy: [{ cita: { inicioProgramado: 'desc' } }, { id: 'desc' }],
      take: HISTORY_LIMIT,
      select: { ...SIGNO_SELECT, citaId: true, cita: { select: { inicioProgramado: true, medicoNombre: true } } },
    }),
  ]);

  const toma: SignosVitalesToma = actual
    ? { values: signosFromRecord(actual), tomadoEn: actual.updatedAt.toISOString(), tomadoPor: await employeeName(prisma, actual.updatedBy) }
    : { values: EMPTY_SIGNOS, tomadoEn: null, tomadoPor: null };

  return {
    toma,
    historial: historial.map(
      (item): SignosHistorialItem => ({
        citaId: item.citaId,
        fecha: item.cita.inicioProgramado.toISOString(),
        medicoNombre: item.cita.medicoNombre,
        values: signosFromRecord(item),
      }),
    ),
  };
}

/** Guarda la toma de signos de la atención en curso (los valores ya vienen validados). */
export async function saveSignosVitales(auth: AuthorizationContext, citaId: number, values: SignosValues) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUnique({
      where: { id: citaId },
      select: { estado: true, activadaAt: true, medicoId: true, usuarioId: true },
    });
    const blocker = attendBlocker(cita, auth);
    if (blocker || !cita) throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);

    const saved = await tx.signosVitales.upsert({
      where: { citaId },
      create: { ...values, citaId, usuarioId: cita.usuarioId, createdBy: auth.empleadoId, updatedBy: auth.empleadoId },
      update: { ...values, updatedBy: auth.empleadoId },
      select: { ...SIGNO_SELECT, updatedAt: true, updatedBy: true },
    });
    return {
      values: signosFromRecord(saved),
      tomadoEn: saved.updatedAt.toISOString(),
      tomadoPor: await employeeName(tx, saved.updatedBy),
    } satisfies SignosVitalesToma;
  });
}
