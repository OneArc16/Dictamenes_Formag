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
};

export const MODULE_DEFINITIONS: readonly ModuleDefinition[] = [
  {
    key: 'medico',
    label: 'Medico',
    href: '/medico',
    description: 'Gestion clinica y seguimiento de dictamenes.',
    allowedRoles: ['MEDICO', 'ADMIN'],
  },
  {
    key: 'admisiones',
    label: 'Admisiones',
    href: '/admisiones',
    description: 'Consulta operativa, impresion y control de estados.',
    allowedRoles: ['ADMISIONISTA', 'ADMIN'],
  },
  {
    key: 'recomendaciones',
    label: 'Recomendaciones',
    href: '/recomendaciones',
    description: 'Formulario laboral independiente para docentes y medicos.',
    allowedRoles: ['MEDICO', 'ADMISIONISTA', 'ADMIN'],
  },
  {
    key: 'admin',
    label: 'Administrador',
    href: '/admin',
    description: 'Configuracion, empleados y gestion del sistema.',
    allowedRoles: ['ADMIN'],
  },
] as const;

export function getDefaultPathForRole(role?: string | null) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'MEDICO') return '/medico';
  if (role === 'ADMISIONISTA') return '/admisiones';
  return '/login';
}

export function getRoleLabel(role?: string | null) {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'MEDICO') return 'Medico';
  if (role === 'ADMISIONISTA') return 'Admisiones';
  return 'Usuario';
}

export function getVisibleModules(role?: string | null) {
  return MODULE_DEFINITIONS.filter((moduleItem) =>
    role ? moduleItem.allowedRoles.includes(role as AppRole) : false,
  );
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
  role: string | null | undefined,
  pathname: string,
) {
  const currentModule = getCurrentModule(pathname);
  if (!currentModule) return true;
  return role ? currentModule.allowedRoles.includes(role as AppRole) : false;
}
