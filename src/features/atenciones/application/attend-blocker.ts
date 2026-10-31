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
