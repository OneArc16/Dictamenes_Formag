import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

export async function requireAdmisionesApi() {
  const store = await cookies();
  const token = store.get('auth')?.value;
  if (!token) return { ok: false as const, status: 401, error: 'No autenticado' };

  const payload = await verifyJwt(token);
  if (!payload) return { ok: false as const, status: 401, error: 'Token inválido' };

  const role = String((payload as any).role);
  if (role !== 'ADMIN' && role !== 'ADMISIONISTA') {
    return { ok: false as const, status: 403, error: 'No autorizado' };
  }

  return { ok: true as const, payload };
}
