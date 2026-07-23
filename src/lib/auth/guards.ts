import { redirect } from 'next/navigation';

import {
  hasAbility,
  hasProtectedAreaAbility,
  requireAuthorizationContext,
  type AbilityCode,
  type AuthorizationContext,
} from '@/lib/auth/authorization';
import type { AppRole, ProtectedAreaKey } from '@/lib/auth/types';

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

async function requireProtectedAreaAccess(areaKey: ProtectedAreaKey) {
  const context = await requireAuthorizationContext();
  if (!hasProtectedAreaAbility(context, areaKey)) redirect('/sin-acceso');
  return context;
}

export async function requireAbility(ability: AbilityCode) {
  const context = await requireAuthorizationContext();
  if (!hasAbility(context, ability)) redirect('/sin-acceso');
  return context;
}

export async function requireAdmin(requiredAbility?: AbilityCode) {
  const context = await requireProtectedAreaAccess('admin');
  if (requiredAbility && !hasAbility(context, requiredAbility)) {
    redirect('/sin-acceso');
  }
  return toAuthUser(context);
}

export async function requireMedicoModule() {
  const context = await requireProtectedAreaAccess('medico');

  return {
    user: toAuthUser(context),
    readOnly: context.role !== 'MEDICO' || !hasAbility(context, 'dictamen.edit'),
    canCreateDictamen: hasAbility(context, 'dictamen.create'),
    canCloseDictamen: hasAbility(context, 'dictamen.close'),
    canReopenDictamen: hasAbility(context, 'dictamen.reopen'),
  };
}

export async function requireAdmisionesModule() {
  const context = await requireProtectedAreaAccess('admisiones');

  return {
    user: toAuthUser(context),
    canReabrirDictamen: hasAbility(context, 'dictamen.reopen'),
  };
}

export async function requireRecomendacionesModule() {
  const context = await requireProtectedAreaAccess('recomendaciones');

  return {
    user: toAuthUser(context),
    readOnly:
      context.role !== 'MEDICO' || !hasAbility(context, 'recomendacion.edit'),
    canCreateRecomendacion: hasAbility(context, 'recomendacion.create'),
    canCloseRecomendacion: hasAbility(context, 'recomendacion.close'),
    canReopenRecomendacion: hasAbility(context, 'recomendacion.reopen'),
  };
}

export async function requireAgendaModule() {
  const context = await requireProtectedAreaAccess('agenda');

  return {
    user: toAuthUser(context),
    canRead: hasAbility(context, 'agenda.read') || hasAbility(context, 'agenda.read.own'),
    canCreate: hasAbility(context, 'agenda.create'),
    canManageSchedules: hasAbility(context, 'agenda.schedule.manage'),
    canCancelSlots: hasAbility(context, 'agenda.slots.cancel'),
  };
}
