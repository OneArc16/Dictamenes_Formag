import { cookies } from 'next/headers';

import { verifyJwt } from '@/lib/auth';

type ApiJwtPayload = {
  sub?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
};

type ApiGuardFailure = {
  ok: false;
  status: number;
  error: string;
};

type ApiGuardSuccess = {
  ok: true;
  payload: ApiJwtPayload;
};

function normalizeRole(role: unknown): string {
  const normalized = String(role ?? '').trim().toUpperCase();

  if (normalized === 'ADMINISTRADOR') return 'ADMIN';
  if (normalized === 'ADMICIONES' || normalized === 'ADMISIONES') return 'ADMISIONISTA';

  return normalized;
}

async function getApiPayload(): Promise<ApiGuardFailure | ApiGuardSuccess> {
  const store = await cookies();
  const token = store.get('auth')?.value;
  if (!token) return { ok: false, status: 401, error: 'No autenticado' };

  const payload = (await verifyJwt(token)) as ApiJwtPayload | null;
  if (!payload) return { ok: false, status: 401, error: 'Token inválido' };

  return { ok: true, payload };
}

export async function requireAdminApi(): Promise<ApiGuardFailure | ApiGuardSuccess> {
  const auth = await getApiPayload();
  if (!auth.ok) return auth;

  if (normalizeRole(auth.payload.role) !== 'ADMIN') {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  return auth;
}

export async function requireAdmisionesApi(): Promise<ApiGuardFailure | ApiGuardSuccess> {
  const auth = await getApiPayload();
  if (!auth.ok) return auth;

  const role = normalizeRole(auth.payload.role);
  if (role !== 'ADMIN' && role !== 'ADMISIONISTA') {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  return auth;
}
