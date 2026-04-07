import type { AppRole, ModuleKey } from '@/lib/module-navigation';
import {
  getAuthorizationContext,
  hasAbility,
  hasAnyAbility,
  hasModuleAbility,
  type AbilityCode,
  type AuthorizationContext,
} from '@/lib/auth/authorization';

type ApiGuardPayload = {
  sub: string;
  name: string;
  role: AppRole;
  perfilId: number | null;
  perfilNombre: string | null;
  permissions: string[];
};

type ApiGuardFailure = {
  ok: false;
  status: number;
  error: string;
};

type ApiGuardSuccess = {
  ok: true;
  payload: ApiGuardPayload;
  auth: AuthorizationContext;
};

function toPayload(auth: AuthorizationContext): ApiGuardPayload {
  return {
    sub: String(auth.empleadoId),
    name: auth.name,
    role: auth.role,
    perfilId: auth.perfilId,
    perfilNombre: auth.perfilNombre,
    permissions: auth.permissions,
  };
}

async function requireApiAuth(): Promise<ApiGuardFailure | ApiGuardSuccess> {
  const auth = await getAuthorizationContext();
  if (!auth) {
    return { ok: false, status: 401, error: 'No autenticado' };
  }

  return {
    ok: true,
    payload: toPayload(auth),
    auth,
  };
}

export async function requireAuthenticatedApi(): Promise<ApiGuardFailure | ApiGuardSuccess> {
  return requireApiAuth();
}

export async function requireModuleApi(
  moduleKey: ModuleKey,
  requiredAbility?: AbilityCode,
): Promise<ApiGuardFailure | ApiGuardSuccess> {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth;

  if (!hasModuleAbility(auth.auth, moduleKey)) {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  if (requiredAbility && !hasAbility(auth.auth, requiredAbility)) {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  return auth;
}

export async function requireAbilityApi(
  ability: AbilityCode,
): Promise<ApiGuardFailure | ApiGuardSuccess> {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth;

  if (!hasAbility(auth.auth, ability)) {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  return auth;
}

export async function requireAnyAbilityApi(
  abilities: AbilityCode[],
): Promise<ApiGuardFailure | ApiGuardSuccess> {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth;

  if (!hasAnyAbility(auth.auth, abilities)) {
    return { ok: false, status: 403, error: 'No autorizado' };
  }

  return auth;
}

export async function requireAdminApi(
  requiredAbility?: AbilityCode,
): Promise<ApiGuardFailure | ApiGuardSuccess> {
  return requireModuleApi('admin', requiredAbility);
}

export async function requireAdmisionesApi(
  requiredAbility?: AbilityCode,
): Promise<ApiGuardFailure | ApiGuardSuccess> {
  return requireModuleApi('admisiones', requiredAbility);
}

export async function requireMedicoApi(
  requiredAbility?: AbilityCode,
): Promise<ApiGuardFailure | ApiGuardSuccess> {
  return requireModuleApi('medico', requiredAbility);
}

export async function requireRecomendacionesApi(
  requiredAbility?: AbilityCode,
): Promise<ApiGuardFailure | ApiGuardSuccess> {
  return requireModuleApi('recomendaciones', requiredAbility);
}