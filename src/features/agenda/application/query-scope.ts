import type { AuthorizationContext } from '@/lib/auth/authorization';
import { hasAbility } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

export async function agendaReadScope(auth: AuthorizationContext) {
  if (hasAbility(auth, 'agenda.read.own') && !hasAbility(auth, 'agenda.read')) {
    return { medicoId: auth.empleadoId, sedeId: null };
  }
  const employee = await prisma.empleado.findUnique({
    where: { id: auth.empleadoId },
    select: { idSede: true },
  });
  return { medicoId: null, sedeId: employee?.idSede ?? null };
}
