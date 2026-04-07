import { redirect } from 'next/navigation';

import type { AppRole, ModuleKey } from '@/lib/module-navigation';
import {
  hasAbility,
  hasModuleAbility,
  requireAuthorizationContext,
  type AbilityCode,
  type AuthorizationContext,
} from '@/lib/auth/authorization';

export type AuthUser = {
  id: string;
  name: string;
  role: AppRole;
  perfilId: number | null;
  perfilNombre: string | null;
  permissions: string[];
};

function toAuthUser(context: AuthorizationContext): AuthUser {
  return {
    id: String(context.empleadoId),
    name: context.name,
    role: context.role,
    perfilId: context.perfilId,
    perfilNombre: context.perfilNombre,
    permissions: context.permissions,
  };
}

async function requireModuleAccess(moduleKey: ModuleKey) {
  const context = await requireAuthorizationContext();
  if (!hasModuleAbility(context, moduleKey)) redirect('/login');
  return context;
}

export async function requireAbility(ability: AbilityCode) {
  const context = await requireAuthorizationContext();
  if (!hasAbility(context, ability)) redirect('/login');
  return context;
}

export async function requireAdmin(requiredAbility?: AbilityCode) {
  const context = await requireModuleAccess('admin');
  if (requiredAbility && !hasAbility(context, requiredAbility)) redirect('/login');
  return toAuthUser(context);
}

export async function requireMedicoModule() {
  const context = await requireModuleAccess('medico');

  return {
    user: toAuthUser(context),
    readOnly: context.role !== 'MEDICO' || !hasAbility(context, 'dictamen.edit'),
    canCreateDictamen: hasAbility(context, 'dictamen.create'),
    canCloseDictamen: hasAbility(context, 'dictamen.close'),
    canReopenDictamen: hasAbility(context, 'dictamen.reopen'),
  };
}

export async function requireAdmisionesModule() {
  const context = await requireModuleAccess('admisiones');

  return {
    user: toAuthUser(context),
    canReabrirDictamen: hasAbility(context, 'dictamen.reopen'),
  };
}

export async function requireRecomendacionesModule() {
  const context = await requireModuleAccess('recomendaciones');

  return {
    user: toAuthUser(context),
    readOnly:
      context.role !== 'MEDICO' || !hasAbility(context, 'recomendacion.edit'),
    canCreateRecomendacion: hasAbility(context, 'recomendacion.create'),
    canCloseRecomendacion: hasAbility(context, 'recomendacion.close'),
    canReopenRecomendacion: hasAbility(context, 'recomendacion.reopen'),
  };
}
