export type AppRole = 'ADMIN' | 'MEDICO' | 'ADMISIONISTA';

export type ModuleKey =
  | 'admin'
  | 'medico'
  | 'admisiones'
  | 'recomendaciones';

export type NavigationIconKey =
  | ModuleKey
  | 'dashboard'
  | 'employees'
  | 'profiles'
  | 'reopen'
  | 'notifications'
  | 'audit';

export type ModuleNavigationItem = {
  key: string;
  label: string;
  href: string;
  iconKey: NavigationIconKey;
  requiredAbility?: string;
};

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  href: string;
  description: string;
  iconKey: NavigationIconKey;
  requiredAbility: string;
  landingAbility?: string;
  secondaryNavigation: readonly ModuleNavigationItem[];
};

export type ModuleAccessInput =
  | { permissions?: readonly string[] | null }
  | null
  | undefined;

export const MODULE_DEFINITIONS: readonly ModuleDefinition[] = [
  {
    key: 'medico',
    label: 'Médico',
    href: '/medico',
    description: 'Gestión clínica y seguimiento de dictámenes.',
    iconKey: 'medico',
    requiredAbility: 'module.medico.access',
    secondaryNavigation: [],
  },
  {
    key: 'admisiones',
    label: 'Admisiones',
    href: '/admisiones',
    description: 'Consulta operativa, impresión y control de estados.',
    iconKey: 'admisiones',
    requiredAbility: 'module.admisiones.access',
    secondaryNavigation: [],
  },
  {
    key: 'recomendaciones',
    label: 'Recomendaciones',
    href: '/recomendaciones',
    description: 'Gestión de recomendaciones laborales para docentes.',
    iconKey: 'recomendaciones',
    requiredAbility: 'module.recomendaciones.access',
    secondaryNavigation: [],
  },
  {
    key: 'admin',
    label: 'Administración',
    href: '/admin',
    description: 'Configuración, empleados, perfiles y auditoría del sistema.',
    iconKey: 'admin',
    requiredAbility: 'module.admin.access',
    landingAbility: 'admin.dashboard.read',
    secondaryNavigation: [
      {
        key: 'dashboard',
        label: 'Resumen',
        href: '/admin',
        iconKey: 'dashboard',
        requiredAbility: 'admin.dashboard.read',
      },
      {
        key: 'employees',
        label: 'Empleados',
        href: '/admin/empleados',
        iconKey: 'employees',
        requiredAbility: 'admin.empleados.read',
      },
      {
        key: 'profiles',
        label: 'Perfiles',
        href: '/admin/perfiles',
        iconKey: 'profiles',
        requiredAbility: 'admin.perfiles.read',
      },
      {
        key: 'reopen-reasons',
        label: 'Motivos de reapertura',
        href: '/admin/motivos-reapertura',
        iconKey: 'reopen',
        requiredAbility: 'admin.motivos_reapertura.read',
      },
      {
        key: 'pcl-notifiers',
        label: 'Notificadores PCL',
        href: '/admin/notificadores-pcl',
        iconKey: 'notifications',
        requiredAbility: 'admin.notificadores_pcl.read',
      },
      {
        key: 'audit',
        label: 'Auditoría',
        href: '/admin/auditoria',
        iconKey: 'audit',
        requiredAbility: 'admin.auditoria.read',
      },
    ],
  },
] as const;

function normalizeModuleAccessInput(input?: ModuleAccessInput) {
  if (!input) {
    return { permissions: [] as string[] };
  }

  return {
    permissions: Array.isArray(input.permissions)
      ? input.permissions.map((permission) => String(permission))
      : [],
  };
}

export function canAccessModule(
  moduleItem: ModuleDefinition,
  input?: ModuleAccessInput,
) {
  const normalized = normalizeModuleAccessInput(input);
  return normalized.permissions.includes(moduleItem.requiredAbility);
}

export function getRoleLabel(role?: string | null) {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'MEDICO') return 'Médico';
  if (role === 'ADMISIONISTA') return 'Admisiones';
  return 'Usuario';
}

export function getVisibleModules(input?: ModuleAccessInput) {
  return MODULE_DEFINITIONS.filter((moduleItem) => canAccessModule(moduleItem, input));
}

export function getVisibleSecondaryNavigation(
  moduleItem: ModuleDefinition,
  input?: ModuleAccessInput,
) {
  const normalized = normalizeModuleAccessInput(input);

  return moduleItem.secondaryNavigation.filter(
    (item) =>
      !item.requiredAbility ||
      normalized.permissions.includes(item.requiredAbility),
  );
}

export function getModuleEntryPath(
  moduleItem: ModuleDefinition,
  input?: ModuleAccessInput,
) {
  const normalized = normalizeModuleAccessInput(input);

  if (
    !moduleItem.landingAbility ||
    normalized.permissions.includes(moduleItem.landingAbility)
  ) {
    return moduleItem.href;
  }

  return getVisibleSecondaryNavigation(moduleItem, normalized)[0]?.href ?? moduleItem.href;
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
