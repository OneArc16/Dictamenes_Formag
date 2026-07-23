import { hasAnyAbility } from './ability-utils';

type CaseScopeContext = {
  empleadoId: number;
  permissions: readonly string[];
};

const GLOBAL_CASE_SCOPE_ABILITIES = [
  'module.admin.access',
  'module.admisiones.access',
] as const;

/**
 * Centraliza el alcance sobre expedientes sin depender de nombres de rol.
 * Los perfiles operativos acceden a sus asignaciones; las áreas con alcance
 * transversal lo reciben mediante permisos explícitos.
 */
export function hasCaseScope(
  auth: CaseScopeContext,
  assignedEmployeeId: number | null,
) {
  return (
    assignedEmployeeId === auth.empleadoId ||
    hasAnyAbility(auth, GLOBAL_CASE_SCOPE_ABILITIES)
  );
}
