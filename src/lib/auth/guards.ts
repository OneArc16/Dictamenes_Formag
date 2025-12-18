// src/lib/auth/guards.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '@/lib/auth';

export type AppRole = 'ADMIN' | 'MEDICO' | 'ADMISIONISTA';

export type AuthUser = {
  id: string;
  name: string;
  role: AppRole;
};

async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const store = await cookies();
    const token = store.get('auth')?.value;
    if (!token) return null;

    const payload = await verifyJwt(token);
    if (!payload) return null;

    const p = payload as any;

    return {
      id: String(p.sub),
      name: String(p.name ?? ''),
      role: String(p.role) as AppRole,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/login');
  return user;
}

/** ✅ MÓDULO MÉDICO: MEDICO puede editar, ADMIN solo lectura */
export async function requireMedicoModule() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const allowed: AppRole[] = ['MEDICO', 'ADMIN'];
  if (!allowed.includes(user.role)) redirect('/login');

  return {
    user,
    readOnly: user.role === 'ADMIN',
  };
}

/** ✅ MÓDULO ADMISIONES: ADMISIONISTA y ADMIN con permisos de admisiones (incluye reabrir) */
export async function requireAdmisionesModule() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const allowed: AppRole[] = ['ADMISIONISTA', 'ADMIN'];
  if (!allowed.includes(user.role)) redirect('/login');

  return {
    user,
    canReabrirDictamen: true, // (ADMIN y ADMISIONISTA)
  };
}
