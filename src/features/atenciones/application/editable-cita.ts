import type { Prisma } from '@prisma/client';

import { ReceptionError } from '@/features/reception/application/errors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';

import { attendBlocker } from './attend-blocker';

/** Cita en atención que el médico autenticado puede modificar; si no, lanza el error del bloqueo. */
export async function editableCita(tx: Prisma.TransactionClient, auth: AuthorizationContext, citaId: number) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  const cita = await tx.cita.findUnique({
    where: { id: citaId },
    select: { estado: true, activadaAt: true, medicoId: true, usuarioId: true },
  });
  const blocker = attendBlocker(cita, auth);
  if (blocker || !cita)
    throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);
  return cita;
}
