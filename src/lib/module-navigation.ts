export type NavigationModuleKey =
  | 'admin'
  | 'medicina-laboral'
  | 'admisiones'
  | 'agenda';

export type NavigationIconKey =
  | NavigationModuleKey
  | 'dictamenes'
  | 'recomendaciones'
  | 'dashboard'
  | 'employees'
  | 'profiles'
  | 'reopen'
  | 'notifications'
  | 'audit'
  | 'agenda-list'
  | 'agenda-create'
  | 'agenda-schedule'
  | 'patient-reception';

type AbilityRequirement =
  | {
      requiredAbility: string;
      requiredAnyAbilities?: never;
    }
  | {
      requiredAbility?: never;
      requiredAnyAbilities: readonly [string, ...string[]];
    };

type NavigationItemBase = {
  key: string;
  label: string;
  href: string;
  iconKey: NavigationIconKey;
};

export type ModuleNavigationItem = NavigationItemBase & AbilityRequirement;

type ModuleDefinitionBase = {
  key: NavigationModuleKey;
  label: string;
  href: string;
  description: string;
  iconKey: NavigationIconKey;
  routePrefixes: readonly [string, ...string[]];
  defaultSecondaryKey?: string;
  secondaryNavigation: readonly ModuleNavigationItem[];
};

export type ModuleDefinition = ModuleDefinitionBase & AbilityRequirement;

export type ModuleAccessInput =
  | { permissions?: readonly string[] | null }
  | null
  | undefined;

export const MODULE_DEFINITIONS = [
  {
    key: 'medicina-laboral',
    label: 'Medicina Laboral',
    href: '/medicina-laboral',
    description: 'Gestión de dictámenes y recomendaciones laborales para docentes.',
    iconKey: 'medicina-laboral',
    routePrefixes: ['/medicina-laboral', '/medico', '/recomendaciones'],
    requiredAnyAbilities: [
      'module.medico.access',
      'module.recomendaciones.access',
    ],
    defaultSecondaryKey: 'dictamenes',
    secondaryNavigation: [
      {
        key: 'dictamenes',
        label: 'Dictámenes',
        href: '/medico',
        iconKey: 'dictamenes',
        requiredAbility: 'module.medico.access',
      },
      {
        key: 'recomendaciones',
        label: 'Recomendaciones',
        href: '/recomendaciones',
        iconKey: 'recomendaciones',
        requiredAbility: 'module.recomendaciones.access',
      },
    ],
  },
  {
    key: 'admisiones',
    label: 'Admisiones',
    href: '/admisiones',
    description: 'Consulta operativa, impresión y control de estados.',
    iconKey: 'admisiones',
    routePrefixes: ['/admisiones'],
    requiredAbility: 'module.admisiones.access',
    defaultSecondaryKey: 'patient-reception',
    secondaryNavigation: [
      {
        key: 'patient-reception',
        label: 'Recepción de pacientes',
        href: '/admisiones/recepcion-pacientes',
        iconKey: 'patient-reception',
        requiredAbility: 'reception.read',
      },
    ],
  },
  {
    key: 'agenda',
    label: 'Agenda Médica',
    href: '/agenda',
    description: 'Horarios laborales, creación y control de cupos médicos.',
    iconKey: 'agenda',
    routePrefixes: ['/agenda'],
    requiredAbility: 'module.agenda.access',
    defaultSecondaryKey: 'agenda-list',
    secondaryNavigation: [
      {
        key: 'agenda-list',
        label: 'Agendas creadas',
        href: '/agenda',
        iconKey: 'agenda-list',
        requiredAnyAbilities: ['agenda.read', 'agenda.read.own'],
      },
      {
        key: 'agenda-create',
        label: 'Crear agenda',
        href: '/agenda/crear',
        iconKey: 'agenda-create',
        requiredAbility: 'agenda.create',
      },
      {
        key: 'agenda-schedule',
        label: 'Horario laboral',
        href: '/agenda/horarios',
        iconKey: 'agenda-schedule',
        requiredAbility: 'agenda.schedule.manage',
      },
    ],
  },
  {
    key: 'admin',
    label: 'Administración',
    href: '/admin',
    description: 'Configuración, empleados, perfiles y auditoría del sistema.',
    iconKey: 'admin',
    routePrefixes: ['/admin'],
    requiredAbility: 'module.admin.access',
    defaultSecondaryKey: 'dashboard',
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
] as const satisfies readonly ModuleDefinition[];

function normalizeModuleAccessInput(input?: ModuleAccessInput) {
  return {
    permissions: Array.isArray(input?.permissions)
      ? input.permissions.map((permission) => String(permission))
      : [],
  };
}

function hasRequiredAccess(
  item: AbilityRequirement & { key?: string },
  permissions: readonly string[],
) {
  const requiredAnyAbilities = item.requiredAnyAbilities;
  if (requiredAnyAbilities) {
    return requiredAnyAbilities.some((ability) =>
      permissions.includes(ability),
    );
  }

  if (!item.requiredAbility) {
    throw new Error(`La navegación ${item.key ?? 'sin clave'} no tiene permisos configurados.`);
  }

  return permissions.includes(item.requiredAbility);
}

function matchesRoutePrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function canAccessModule(
  moduleItem: ModuleDefinition,
  input?: ModuleAccessInput,
) {
  const { permissions } = normalizeModuleAccessInput(input);
  return hasRequiredAccess(moduleItem, permissions);
}

export function getRoleLabel(role?: string | null) {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'MEDICO') return 'Médico';
  if (role === 'ADMISIONISTA') return 'Admisiones';
  return 'Usuario';
}

export function getVisibleModules(input?: ModuleAccessInput) {
  return MODULE_DEFINITIONS.filter((moduleItem) =>
    canAccessModule(moduleItem, input),
  );
}

export function getVisibleSecondaryNavigation(
  moduleItem: ModuleDefinition,
  input?: ModuleAccessInput,
) {
  const { permissions } = normalizeModuleAccessInput(input);

  return moduleItem.secondaryNavigation.filter((item) =>
    hasRequiredAccess(item, permissions),
  );
}

export function getModuleEntryPath(
  moduleItem: ModuleDefinition,
  input?: ModuleAccessInput,
) {
  const visibleNavigation = getVisibleSecondaryNavigation(moduleItem, input);
  if (visibleNavigation.length === 0) return moduleItem.href;

  if (
    moduleItem.defaultSecondaryKey &&
    !moduleItem.secondaryNavigation.some(
      (item) => item.key === moduleItem.defaultSecondaryKey,
    )
  ) {
    throw new Error(
      `El acceso predeterminado ${moduleItem.defaultSecondaryKey} no existe en ${moduleItem.key}.`,
    );
  }

  const defaultNavigation = moduleItem.defaultSecondaryKey
    ? visibleNavigation.find(
        (item) => item.key === moduleItem.defaultSecondaryKey,
      )
    : null;

  return defaultNavigation?.href ?? visibleNavigation[0].href;
}

export function isModuleNavigationActive(
  pathname: string,
  moduleItem: ModuleDefinition,
) {
  return moduleItem.routePrefixes.some((prefix) =>
    matchesRoutePrefix(pathname, prefix),
  );
}

export function isSecondaryNavigationActive(
  pathname: string,
  item: ModuleNavigationItem,
  moduleItem: ModuleDefinition,
) {
  if (item.href === moduleItem.href) {
    return pathname === item.href;
  }

  return matchesRoutePrefix(pathname, item.href);
}

export function getModuleByKey(key: NavigationModuleKey) {
  return MODULE_DEFINITIONS.find((moduleItem) => moduleItem.key === key) ?? null;
}

export function getCurrentModule(pathname: string) {
  return (
    MODULE_DEFINITIONS.find((moduleItem) =>
      isModuleNavigationActive(pathname, moduleItem),
    ) ?? null
  );
}
