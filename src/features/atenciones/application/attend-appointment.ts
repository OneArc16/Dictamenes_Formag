import { Prisma } from '@prisma/client';

import { parseAntecedentesFamiliares } from '@/features/atenciones/domain/antecedentes-familiares';
import { esMujer, parseAntecedentesGinecobstetricos } from '@/features/atenciones/domain/antecedentes-ginecobstetricos';
import { parseAntecedentesPersonales } from '@/features/atenciones/domain/antecedentes-personales';
import { atencionPendientes, type AtencionForm } from '@/features/atenciones/domain/atencion-form';
import { ReceptionError } from '@/features/reception/application/errors';
import { markAppointmentAttendedInTransaction } from '@/features/reception/application/reception-service';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

/** Origen con el que el módulo de Atenciones registra el encuentro clínico de la cita. */
export const ATENCIONES_ENCOUNTER_SOURCE = 'ATENCIONES';

type AttendCandidate = { estado: string; activadaAt: Date | null; medicoId: number };

/** Motivo por el que la cita no se puede atender desde Atenciones, o null si se puede. */
export function attendBlocker(cita: AttendCandidate | null, auth: Pick<AuthorizationContext, 'role' | 'empleadoId'>) {
  if (!cita) return 'La cita no existe.';
  if (cita.estado === 'ATENDIDA') return 'El paciente ya fue atendido.';
  if (cita.estado !== 'ASIGNADA') return 'La cita ya no está vigente.';
  if (!cita.activadaAt) return 'Recepción aún no ha activado al paciente.';
  // El médico solo atiende a sus pacientes; los demás perfiles con el permiso pueden hacerlo por él.
  if (auth.role === 'MEDICO' && cita.medicoId !== auth.empleadoId) return 'Solo el médico asignado puede atender a este paciente.';
  return null;
}

export async function attendAppointment(auth: AuthorizationContext, appointmentId: number) {
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUnique({
      where: { id: appointmentId },
      select: {
        estado: true,
        activadaAt: true,
        medicoId: true,
        usuarioId: true,
        paciente: { select: { sexo: true } },
        atencion: { select: { motivoConsulta: true, enfermedadActual: true } },
      },
    });
    const blocker = attendBlocker(cita, auth);
    if (blocker || !cita) throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);
    const pendientes = atencionPendientes({
      motivoConsulta: cita.atencion?.motivoConsulta ?? '',
      enfermedadActual: cita.atencion?.enfermedadActual ?? '',
    });
    if (pendientes.length > 0) {
      throw new ReceptionError(
        'ATENCION_INCOMPLETA',
        `Completa antes de finalizar: ${pendientes.map((item) => item.label).join(', ')}.`,
        422,
      );
    }
    // La historia de esta atención conserva los antecedentes tal como estaban al finalizarla.
    const mujer = esMujer(cita.paciente.sexo);
    const [personales, familiares, gineco] = await Promise.all([
      tx.antecedentesPersonales.findUnique({ where: { usuarioId: cita.usuarioId }, select: { datos: true } }),
      tx.antecedentesFamiliares.findUnique({ where: { usuarioId: cita.usuarioId }, select: { datos: true } }),
      mujer
        ? tx.antecedentesGinecobstetricos.findUnique({ where: { usuarioId: cita.usuarioId }, select: { datos: true } })
        : null,
    ]);
    await tx.atencion.update({
      where: { citaId: appointmentId },
      data: {
        antecedentesPersonales: parseAntecedentesPersonales(personales?.datos) as unknown as Prisma.InputJsonValue,
        antecedentesFamiliares: parseAntecedentesFamiliares(familiares?.datos) as unknown as Prisma.InputJsonValue,
        antecedentesGineco: mujer
          ? (parseAntecedentesGinecobstetricos(gineco?.datos) as unknown as Prisma.InputJsonValue)
          : Prisma.DbNull,
        updatedBy: auth.empleadoId,
      },
    });
    return markAppointmentAttendedInTransaction(tx, auth, appointmentId, {
      source: ATENCIONES_ENCOUNTER_SOURCE,
      id: `cita-${appointmentId}`,
      occurredAt: new Date(),
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function saveAtencion(auth: AuthorizationContext, appointmentId: number, patch: Partial<AtencionForm>) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUnique({
      where: { id: appointmentId },
      select: { estado: true, activadaAt: true, medicoId: true },
    });
    const blocker = attendBlocker(cita, auth);
    if (blocker) throw new ReceptionError('INVALID_TRANSITION', blocker, cita ? 409 : 404);
    const saved = await tx.atencion.upsert({
      where: { citaId: appointmentId },
      create: { citaId: appointmentId, ...patch, createdBy: auth.empleadoId, updatedBy: auth.empleadoId },
      update: { ...patch, updatedBy: auth.empleadoId },
      select: { motivoConsulta: true, enfermedadActual: true, updatedAt: true },
    });
    return {
      motivoConsulta: saved.motivoConsulta ?? '',
      enfermedadActual: saved.enfermedadActual ?? '',
      updatedAt: saved.updatedAt.toISOString(),
    };
  });
}
