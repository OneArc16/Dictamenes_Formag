import type { ModuleKey } from '@/lib/module-navigation';

export type AbilityCode = string;

type PermissionCarrier = {
  permissions?: readonly AbilityCode[] | null;
};

const MODULE_ABILITY_BY_KEY: Record<ModuleKey, AbilityCode> = {
  admin: 'module.admin.access',
  medico: 'module.medico.access',
  admisiones: 'module.admisiones.access',
  recomendaciones: 'module.recomendaciones.access',
};

function resolvePermissions(
  source: readonly AbilityCode[] | PermissionCarrier | null | undefined,
): readonly AbilityCode[] {
  if (Array.isArray(source)) {
    return source;
  }

  return (source as PermissionCarrier | null | undefined)?.permissions ?? [];
}

export function hasAbility(
  source: readonly AbilityCode[] | PermissionCarrier | null | undefined,
  ability: AbilityCode,
) {
  return resolvePermissions(source).includes(ability);
}

export function hasAnyAbility(
  source: readonly AbilityCode[] | PermissionCarrier | null | undefined,
  abilities: readonly AbilityCode[],
) {
  return abilities.some((ability) => hasAbility(source, ability));
}

export function hasAllAbilities(
  source: readonly AbilityCode[] | PermissionCarrier | null | undefined,
  abilities: readonly AbilityCode[],
) {
  return abilities.every((ability) => hasAbility(source, ability));
}

export function hasModuleAbility(
  source: readonly AbilityCode[] | PermissionCarrier | null | undefined,
  moduleKey: ModuleKey,
) {
  return hasAbility(source, MODULE_ABILITY_BY_KEY[moduleKey]);
}
