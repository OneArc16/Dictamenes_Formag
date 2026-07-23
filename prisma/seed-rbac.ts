import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const AUDIT_USER = 'seed-rbac';

const permissions = [
  { codigo: 'module.admin.access', nombre: 'Acceso al modulo Administrador', modulo: 'module' },
  { codigo: 'module.medico.access', nombre: 'Acceso al modulo Medico', modulo: 'module' },
  { codigo: 'module.admisiones.access', nombre: 'Acceso al modulo Admisiones', modulo: 'module' },
  { codigo: 'module.recomendaciones.access', nombre: 'Acceso al modulo Recomendaciones', modulo: 'module' },
  { codigo: 'module.agenda.access', nombre: 'Acceso al modulo Agenda Medica', modulo: 'module' },

  { codigo: 'agenda.read', nombre: 'Consultar agendas y cupos', modulo: 'agenda' },
  { codigo: 'agenda.read.own', nombre: 'Consultar agenda medica propia', modulo: 'agenda' },
  { codigo: 'agenda.create', nombre: 'Crear agendas medicas', modulo: 'agenda' },
  { codigo: 'agenda.schedule.manage', nombre: 'Gestionar horarios laborales', modulo: 'agenda' },
  { codigo: 'agenda.slots.cancel', nombre: 'Cancelar cupos disponibles', modulo: 'agenda' },

  { codigo: 'admin.dashboard.read', nombre: 'Ver dashboard administrativo', modulo: 'admin' },
  { codigo: 'admin.empleados.read', nombre: 'Ver empleados', modulo: 'admin' },
  { codigo: 'admin.empleados.manage', nombre: 'Gestionar empleados', modulo: 'admin' },
  { codigo: 'admin.perfiles.read', nombre: 'Ver perfiles', modulo: 'admin' },
  { codigo: 'admin.perfiles.manage', nombre: 'Gestionar perfiles', modulo: 'admin' },
  { codigo: 'admin.motivos_reapertura.read', nombre: 'Ver motivos de reapertura', modulo: 'admin' },
  { codigo: 'admin.motivos_reapertura.manage', nombre: 'Gestionar motivos de reapertura', modulo: 'admin' },
  { codigo: 'admin.notificadores_pcl.read', nombre: 'Ver notificadores PCL', modulo: 'admin' },
  { codigo: 'admin.notificadores_pcl.manage', nombre: 'Gestionar notificadores PCL', modulo: 'admin' },
  { codigo: 'admin.auditoria.read', nombre: 'Ver auditoria', modulo: 'admin' },
  { codigo: 'admin.auditoria.export', nombre: 'Exportar auditoria', modulo: 'admin' },

  { codigo: 'dictamen.read', nombre: 'Ver dictamenes', modulo: 'dictamen' },
  { codigo: 'dictamen.create', nombre: 'Crear dictamenes', modulo: 'dictamen' },
  { codigo: 'dictamen.edit', nombre: 'Editar dictamenes', modulo: 'dictamen' },
  { codigo: 'dictamen.close', nombre: 'Cerrar dictamenes', modulo: 'dictamen' },
  { codigo: 'dictamen.reopen', nombre: 'Reabrir dictamenes', modulo: 'dictamen' },
  { codigo: 'dictamen.print', nombre: 'Imprimir dictamenes', modulo: 'dictamen' },
  { codigo: 'dictamen.export', nombre: 'Exportar dictamenes', modulo: 'dictamen' },
  { codigo: 'formulario_origen.read', nombre: 'Ver formularios de origen', modulo: 'formulario_origen' },
  { codigo: 'formulario_origen.edit', nombre: 'Editar formularios de origen', modulo: 'formulario_origen' },
  { codigo: 'formulario_origen.finalize', nombre: 'Finalizar formularios de origen', modulo: 'formulario_origen' },
  { codigo: 'formulario_origen.reopen', nombre: 'Reabrir formularios de origen', modulo: 'formulario_origen' },

  { codigo: 'recomendacion.read', nombre: 'Ver recomendaciones', modulo: 'recomendacion' },
  { codigo: 'recomendacion.create', nombre: 'Crear recomendaciones', modulo: 'recomendacion' },
  { codigo: 'recomendacion.edit', nombre: 'Editar recomendaciones', modulo: 'recomendacion' },
  { codigo: 'recomendacion.close', nombre: 'Cerrar recomendaciones', modulo: 'recomendacion' },
  { codigo: 'recomendacion.reopen', nombre: 'Reabrir recomendaciones', modulo: 'recomendacion' },
  { codigo: 'recomendacion.print', nombre: 'Imprimir recomendaciones', modulo: 'recomendacion' },
  { codigo: 'recomendacion.export', nombre: 'Exportar recomendaciones', modulo: 'recomendacion' },
] as const;

const PROFILE_ALIASES = {
  ADMIN: ['ADMINISTRADOR', 'ADMIN'],
  ADMISIONISTA: ['ADMISIONISTA', 'ADMISIONES'],
  MEDICO: ['MEDICO'],
} as const;

const PROFILE_PERMISSION_CODES: Record<keyof typeof PROFILE_ALIASES, string[]> = {
  ADMIN: permissions.map((permission) => permission.codigo),

  ADMISIONISTA: [
    'module.admisiones.access',
    'module.recomendaciones.access',
    'module.agenda.access',
    'agenda.read',

    'dictamen.read',
    'dictamen.reopen',
    'dictamen.print',
    'dictamen.export',
    'formulario_origen.read',
    'formulario_origen.reopen',

    'recomendacion.read',
    'recomendacion.reopen',
    'recomendacion.print',
    'recomendacion.export',
  ],

  MEDICO: [
    'module.medico.access',
    'module.recomendaciones.access',
    'module.agenda.access',
    'agenda.read.own',

    'dictamen.read',
    'dictamen.create',
    'dictamen.edit',
    'dictamen.close',
    'dictamen.print',
    'dictamen.export',
    'formulario_origen.read',
    'formulario_origen.edit',
    'formulario_origen.finalize',
    'formulario_origen.reopen',

    'recomendacion.read',
    'recomendacion.create',
    'recomendacion.edit',
    'recomendacion.close',
    'recomendacion.reopen',
    'recomendacion.print',
    'recomendacion.export',
  ],
};

async function resolveProfile(aliases: readonly string[]) {
  return prisma.perfil.findFirst({
    where: {
      OR: aliases.map((alias) => ({
        nombre: { equals: alias, mode: 'insensitive' },
      })),
    },
    select: { id: true, nombre: true },
  });
}

async function main() {
  for (const permission of permissions) {
    await prisma.permiso.upsert({
      where: { codigo: permission.codigo },
      update: {
        nombre: permission.nombre,
        modulo: permission.modulo,
        estado: 1,
        updatedBy: AUDIT_USER,
      },
      create: {
        codigo: permission.codigo,
        nombre: permission.nombre,
        descripcion: null,
        modulo: permission.modulo,
        estado: 1,
        createdBy: AUDIT_USER,
        updatedBy: AUDIT_USER,
      },
    });
  }

  const permissionRows = await prisma.permiso.findMany({
    where: { codigo: { in: permissions.map((permission) => permission.codigo) } },
    select: { id: true, codigo: true },
  });

  const permissionIdByCode = new Map(
    permissionRows.map((permission) => [permission.codigo, permission.id]),
  );

  for (const [profileKey, aliases] of Object.entries(PROFILE_ALIASES) as Array<
    [keyof typeof PROFILE_ALIASES, readonly string[]]
  >) {
    const profile = await resolveProfile(aliases);

    if (!profile) {
      throw new Error(
        `No encontre un perfil para ${profileKey}. Revise estos nombres: ${aliases.join(', ')}`,
      );
    }

    const assignedCodes = PROFILE_PERMISSION_CODES[profileKey];
    const staleCodes = permissions
      .map((permission) => permission.codigo)
      .filter((code) => !assignedCodes.includes(code));

    if (staleCodes.length > 0) {
      await prisma.perfilPermiso.deleteMany({
        where: {
          perfilId: profile.id,
          permiso: {
            codigo: { in: staleCodes },
          },
        },
      });
    }

    for (const code of assignedCodes) {
      const permissionId = permissionIdByCode.get(code);
      if (!permissionId) {
        throw new Error(`No encontre el permiso ${code} despues del upsert`);
      }

      await prisma.perfilPermiso.upsert({
        where: {
          perfilId_permisoId: {
            perfilId: profile.id,
            permisoId: permissionId,
          },
        },
        update: {
          permitido: true,
          updatedBy: AUDIT_USER,
        },
        create: {
          perfilId: profile.id,
          permisoId: permissionId,
          permitido: true,
          createdBy: AUDIT_USER,
          updatedBy: AUDIT_USER,
        },
      });
    }

    console.log(
      `Perfil ${profile.nombre}: ${assignedCodes.length} permisos sincronizados`,
    );
  }

  console.log('RBAC seed ejecutado correctamente');
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed RBAC:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
