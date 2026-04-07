import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { verifyJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  hasAbility,
  hasAllAbilities,
  hasAnyAbility,
  hasModuleAbility,
  type AbilityCode,
} from '@/lib/auth/ability-utils';
import type { AppRole } from '@/lib/module-navigation';

export type AuthorizationContext = {
  empleadoId: number;
  name: string;
  role: AppRole;
  perfilId: number | null;
  perfilNombre: string | null;
  permissions: AbilityCode[];
};

type JwtLikePayload = {
  sub?: string;
  name?: string;
  role?: string;
};

const ROLE_ALIASES: Record<AppRole, readonly string[]> = {
  ADMIN: ['ADMIN', 'ADMINISTRADOR'],
  MEDICO: ['MEDICO'],
  ADMISIONISTA: ['ADMISIONISTA', 'ADMISIONES', 'ADMICIONES', 'ADMISION'],
};

const MODULE_ACCESS_BY_ROLE: Record<AppRole, AbilityCode> = {
  ADMIN: 'module.admin.access',
  MEDICO: 'module.medico.access',
  ADMISIONISTA: 'module.admisiones.access',
};

export function normalizeAppRole(role: unknown): AppRole | null {
  const normalized = String(role ?? '').trim().toUpperCase();
  if (!normalized) return null;

  for (const [appRole, aliases] of Object.entries(ROLE_ALIASES) as Array<
    [AppRole, readonly string[]]
  >) {
    if (aliases.includes(normalized)) {
      return appRole;
    }
  }

  return null;
}

export function inferAppRoleFromPermissionCodes(
  permissionCodes: readonly AbilityCode[],
  fallbackRole?: unknown,
): AppRole | null {
  const permissions = new Set(permissionCodes);

  if (permissions.has(MODULE_ACCESS_BY_ROLE.ADMIN)) return 'ADMIN';
  if (permissions.has(MODULE_ACCESS_BY_ROLE.MEDICO)) return 'MEDICO';
  if (permissions.has(MODULE_ACCESS_BY_ROLE.ADMISIONISTA)) return 'ADMISIONISTA';

  return normalizeAppRole(fallbackRole);
}

export async function getAuthorizationContext(): Promise<AuthorizationContext | null> {
  try {
    const store = await cookies();
    const token = store.get('auth')?.value;
    if (!token) return null;

    const payload = (await verifyJwt(token)) as JwtLikePayload | null;
    if (!payload) return null;

    const empleadoId = Number(payload.sub);
    if (!Number.isFinite(empleadoId)) return null;

    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      include: {
        perfil: {
          include: {
            permisos: {
              where: {
                permitido: true,
                permiso: { estado: 1 },
              },
              include: {
                permiso: {
                  select: { codigo: true },
                },
              },
            },
          },
        },
      },
    });

    if (!empleado || !empleado.activo) return null;

    const permissionCodes = Array.from(
      new Set(
        (empleado.perfil?.permisos ?? [])
          .map((perfilPermiso) => perfilPermiso.permiso.codigo)
          .filter((codigo): codigo is string => Boolean(codigo)),
      ),
    ).sort();

    const role = inferAppRoleFromPermissionCodes(
      permissionCodes,
      payload.role ?? empleado.perfil?.nombre ?? null,
    );

    if (!role) return null;

    return {
      empleadoId,
      name:
        String(payload.name ?? '').trim() ||
        `${empleado.primerNombre} ${empleado.primerApellido}`.trim() ||
        'Usuario',
      role,
      perfilId: empleado.perfilId ?? null,
      perfilNombre: empleado.perfil?.nombre ?? null,
      permissions: permissionCodes,
    };
  } catch {
    return null;
  }
}

export async function requireAuthorizationContext(): Promise<AuthorizationContext> {
  const context = await getAuthorizationContext();
  if (!context) redirect('/login');
  return context;
}

export { hasAbility, hasAllAbilities, hasAnyAbility, hasModuleAbility };
