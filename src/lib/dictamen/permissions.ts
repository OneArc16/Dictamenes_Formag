import type { AuthorizationContext } from '@/lib/auth/authorization';

export type DictamenEditableRecord = {
  empleadoId: number | null;
};

export type DictamenPermissionResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export function canEditDictamen(
  dictamen: DictamenEditableRecord,
  auth: Pick<AuthorizationContext, 'role' | 'empleadoId'>,
): DictamenPermissionResult {
  if (auth.role !== 'MEDICO') {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  if (!Number.isFinite(auth.empleadoId) || dictamen.empleadoId !== auth.empleadoId) {
    return { ok: false, status: 403, error: 'No tiene permiso sobre este dictamen' };
  }

  return { ok: true };
}
