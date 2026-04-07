import type { AppRole } from '@/lib/module-navigation';
import { getAuthorizationContext } from '@/lib/auth/authorization';

export type Session =
  | {
      sub: string;
      name: string;
      role: AppRole;
      perfilId: number | null;
      perfilNombre: string | null;
      permissions: string[];
    }
  | null;

export async function getSession(): Promise<Session> {
  const auth = await getAuthorizationContext();
  if (!auth) return null;

  return {
    sub: String(auth.empleadoId),
    name: auth.name,
    role: auth.role,
    perfilId: auth.perfilId,
    perfilNombre: auth.perfilNombre,
    permissions: auth.permissions,
  };
}
