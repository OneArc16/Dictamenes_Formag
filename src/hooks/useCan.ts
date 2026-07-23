import { useMemo } from 'react';

import {
  hasAbility,
  hasAllAbilities,
  hasAnyAbility,
  hasProtectedAreaAbility,
  type AbilityCode,
} from '@/lib/auth/ability-utils';
import type { ProtectedAreaKey } from '@/lib/auth/types';
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

export function useCanAccessArea(areaKey: ProtectedAreaKey) {
  const auth = useAuthMe();

  return {
    ...auth,
    can: useMemo(
      () => hasProtectedAreaAbility(auth.data, areaKey),
      [auth.data, areaKey],
    ),
  };
}
