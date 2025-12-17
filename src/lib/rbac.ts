export type AdminMode = 'ADMIN' | 'MEDICO_VIEW' | 'ADMISION';

export const ADMIN_MODE_COOKIE = 'admin_mode';

export const adminModeLabel: Record<AdminMode, string> = {
  ADMIN: 'Modo Admin',
  MEDICO_VIEW: 'Como Médico (solo lectura)',
  ADMISION: 'Como Admisión (operativo)',
};

export type Ability =
  | 'HC_VIEW'
  | 'HC_EDIT'
  | 'ADMISION_ACTIONS'
  | 'DICTAMEN_REOPEN';

export function can(mode: AdminMode, ability: Ability) {
  // Regla actual según lo que definimos: admisión puede reabrir también.
  switch (ability) {
    case 'HC_VIEW':
      return true; // todos los modos ven
    case 'HC_EDIT':
      return mode === 'ADMIN'; // por ahora solo admin (y luego lo refinamos)
    case 'ADMISION_ACTIONS':
      return mode === 'ADMIN' || mode === 'ADMISION';
    case 'DICTAMEN_REOPEN':
      return mode === 'ADMIN' || mode === 'ADMISION';
    default:
      return false;
  }
}
