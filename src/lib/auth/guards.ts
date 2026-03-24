import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { verifyJwt } from '@/lib/auth';
import type { AppRole } from '@/lib/module-navigation';

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

    const data = payload as {
      sub?: string;
      name?: string;
      role?: AppRole;
    };

    return {
      id: String(data.sub ?? ''),
      name: String(data.name ?? ''),
      role: String(data.role ?? '') as AppRole,
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

export async function requireAdmisionesModule() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const allowed: AppRole[] = ['ADMISIONISTA', 'ADMIN'];
  if (!allowed.includes(user.role)) redirect('/login');

  return {
    user,
    canReabrirDictamen: true,
  };
}

export async function requireRecomendacionesModule() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const allowed: AppRole[] = ['MEDICO', 'ADMISIONISTA', 'ADMIN'];
  if (!allowed.includes(user.role)) redirect('/login');

  return {
    user,
    readOnly: user.role !== 'MEDICO',
  };
}
