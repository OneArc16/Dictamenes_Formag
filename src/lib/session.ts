import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

export type Session =
  | { sub: string; name: string; role: 'ADMIN' | 'ADMISIONISTA' | 'MEDICO' }
  | null;

export async function getSession(): Promise<Session> {
  try {
    const store = await cookies();                 // seguro con Next 14/15
    const token = store.get('auth')?.value;
    if (!token) return null;
    const payload = await verifyJwt(token);
    return {
      sub: String(payload.sub),
      name: String(payload.name ?? ''),
      role: payload.role as any,
    };
  } catch {
    return null;
  }
}
