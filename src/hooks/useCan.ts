import { useMemo } from 'react';

import type { ModuleKey } from '@/lib/module-navigation';
import {
  hasAbility,
  hasAllAbilities,
  hasAnyAbility,
  hasModuleAbility,
  type AbilityCode,
} from '@/lib/auth/ability-utils';
import { useAuthMe } from '@/hooks/useAuthMe';

export function useCan(ability: AbilityCode) {
  const auth = useAuthMe();

  return {
    ...auth,
    can: useMemo(() => hasAbility(auth.data, ability), [auth.data, ability]),
  };
}

export function useCanAny(abilities: readonly AbilityCode[]) {
  const auth = useAuthMe();

  return {
    ...auth,
    can: useMemo(() => hasAnyAbility(auth.data, abilities), [auth.data, abilities]),
  };
}

export function useCanAll(abilities: readonly AbilityCode[]) {
  const auth = useAuthMe();

  return {
    ...auth,
    can: useMemo(() => hasAllAbilities(auth.data, abilities), [auth.data, abilities]),
  };
}

export function useCanAccessModule(moduleKey: ModuleKey) {
  const auth = useAuthMe();

  return {
    ...auth,
    can: useMemo(() => hasModuleAbility(auth.data, moduleKey), [auth.data, moduleKey]),
  };
}
