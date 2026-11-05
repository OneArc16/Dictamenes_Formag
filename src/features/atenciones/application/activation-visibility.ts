import { hasAbility, type AbilityCode } from '@/lib/auth/ability-utils';

/** Permission that lets clinical staff see when reception activated an appointment. */
export const ACTIVATION_VIEW_ABILITY: AbilityCode = 'appointment.activation.view';

type PermissionSource = Parameters<typeof hasAbility>[0];

/** Returns the activation timestamp only when the viewer may see it; otherwise null. */
export function visibleActivadaAt(source: PermissionSource, activadaAt: Date | null) {
  if (!activadaAt || !hasAbility(source, ACTIVATION_VIEW_ABILITY)) return null;
  return activadaAt.toISOString();
}
