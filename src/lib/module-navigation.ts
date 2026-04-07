export type AppRole = 'ADMIN' | 'MEDICO' | 'ADMISIONISTA';

export type ModuleKey =
  | 'admin'
  | 'medico'
  | 'admisiones'
  | 'recomendaciones';

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  href: string;
  description: string;
  allowedRoles: AppRole[];
  requiredAbility: string;
};

export type ModuleAccessInput =
  | {
      role?: string | null;
      permissions?: readonly string[] | null;
    }
  | string
  | null
  | undefined;

export const MODULE_DEFINITIONS: readonly ModuleDefinition[] = [
  {
    key: 'medico',
    label: 'Medico',
    href: '/medico',
    description: 'Gestion clinica y seguimiento de dictamenes.',
    allowedRoles: ['MEDICO', 'ADMIN'],
    requiredAbility: 'module.medico.access',
  },
  {
    key: 'admisiones',
    label: 'Admisiones',
    href: '/admisiones',
    description: 'Consulta operativa, impresion y control de estados.',
    allowedRoles: ['ADMISIONISTA', 'ADMIN'],
    requiredAbility: 'module.admisiones.access',
  },
  {
    key: 'recomendaciones',
    label: 'Recomendaciones',
    href: '/recomendaciones',
    description: 'Formulario laboral independiente para docentes y medicos.',
    allowedRoles: ['MEDICO', 'ADMISIONISTA', 'ADMIN'],
    requiredAbility: 'module.recomendaciones.access',
  },
  {
    key: 'admin',
    label: 'Administrador',
    href: '/admin',
    description: 'Configuracion, empleados y gestion del sistema.',
    allowedRoles: ['ADMIN'],
    requiredAbility: 'module.admin.access',
  },
] as const;

const DEFAULT_MODULE_BY_ROLE: Record<AppRole, ModuleKey> = {
  ADMIN: 'admin',
  MEDICO: 'medico',
  ADMISIONISTA: 'admisiones',
};

function normalizeModuleAccessInput(input?: ModuleAccessInput) {
  if (!input) {
    return { role: null, permissions: [] as string[] };
  }

  if (typeof input === 'string') {
    return { role: input, permissions: [] as string[] };
  }

  return {
    role: input.role ?? null,
    permissions: Array.isArray(input.permissions)
      ? input.permissions.map((permission) => String(permission))
      : [],
  };
}

function canAccessModule(moduleItem: ModuleDefinition, input?: ModuleAccessInput) {
  const normalized = normalizeModuleAccessInput(input);

  if (normalized.permissions.includes(moduleItem.requiredAbility)) {
    return true;
  }

  return normalized.role
    ? moduleItem.allowedRoles.includes(normalized.role as AppRole)
    : false;
}

export function getDefaultPathForUser(input?: ModuleAccessInput) {
  const normalized = normalizeModuleAccessInput(input);
  const normalizedRole = normalized.role as AppRole | null;

  if (normalizedRole) {
    const defaultKey = DEFAULT_MODULE_BY_ROLE[normalizedRole];
    const defaultModule = getModuleByKey(defaultKey);

    if (defaultModule && canAccessModule(defaultModule, normalized)) {
      return defaultModule.href;
    }
  }

  return getVisibleModules(normalized)[0]?.href ?? '/login';
}

export function getDefaultPathForRole(role?: string | null) {
  return getDefaultPathForUser(role);
}

export function getRoleLabel(role?: string | null) {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'MEDICO') return 'Medico';
  if (role === 'ADMISIONISTA') return 'Admisiones';
  return 'Usuario';
}

export function getVisibleModules(input?: ModuleAccessInput) {
  return MODULE_DEFINITIONS.filter((moduleItem) => canAccessModule(moduleItem, input));
}

export function getModuleByKey(key: ModuleKey) {
  return MODULE_DEFINITIONS.find((moduleItem) => moduleItem.key === key) ?? null;
}

export function getCurrentModule(pathname: string) {
  return (
    MODULE_DEFINITIONS.find(
      (moduleItem) =>
        pathname === moduleItem.href || pathname.startsWith(`${moduleItem.href}/`),
    ) ?? null
  );
}

export function canAccessModulePath(
  input: ModuleAccessInput,
  pathname: string,
) {
  const currentModule = getCurrentModule(pathname);
  if (!currentModule) return true;
  return canAccessModule(currentModule, input);
}