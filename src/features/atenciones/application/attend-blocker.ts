import type { AuthorizationContext } from '@/lib/auth/authorization';

type AttendCandidate = { estado: string; activadaAt: Date | null; medicoId: number };

/** Motivo por el que la cita no se puede atender desde Atenciones, o null si se puede. */
export function attendBlocker(cita: AttendCandidate | null, auth: Pick<AuthorizationContext, 'role' | 'empleadoId'>) {
  if (!cita) return 'La cita no existe.';
  if (cita.estado === 'ATENDIDA') return 'El paciente ya fue atendido.';
  if (cita.estado !== 'ASIGNADA') return 'La cita ya no está vigente.';
  if (!cita.activadaAt) return 'Recepción aún no ha activado al paciente.';
  // El médico solo atiende a sus pacientes; los demás perfiles con el permiso pueden hacerlo por él.
  if (auth.role === 'MEDICO' && cita.medicoId !== auth.empleadoId)
    return 'Solo el médico asignado puede atender a este paciente.';
  return null;
}

/**
 * Motivo por el que no se puede editar la atención, o null si se puede. Antes de finalizar
 * aplica lo mismo que atender; ya finalizada, solo la edita el médico que la atendió.
 */
export function editBlocker(cita: AttendCandidate | null, auth: Pick<AuthorizationContext, 'role' | 'empleadoId'>) {
  if (cita?.estado === 'ATENDIDA') {
    return cita.medicoId === auth.empleadoId ? null : 'Solo el médico que atendió puede editar esta atención.';
  }
  return attendBlocker(cita, auth);
}
