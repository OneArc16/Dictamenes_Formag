import { Prisma } from '@prisma/client';

import { ReceptionError } from '@/features/reception/application/errors';
import { markAppointmentAttendedInTransaction } from '@/features/reception/application/reception-service';
import type { AuthorizationContext } from '@/lib/auth/authorization';
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
      select: { estado: true, activadaAt: true, medicoId: true },
    });
    const blocker = attendBlocker(cita, auth);
    if (blocker) throw new ReceptionError('INVALID_TRANSITION', blocker, cita ? 409 : 404);
    return markAppointmentAttendedInTransaction(tx, auth, appointmentId, {
      source: ATENCIONES_ENCOUNTER_SOURCE,
      id: `cita-${appointmentId}`,
      occurredAt: new Date(),
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
