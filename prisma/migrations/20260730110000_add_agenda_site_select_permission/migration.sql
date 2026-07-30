INSERT INTO "permisos" (
  "codigo", "nombre", "descripcion", "modulo", "estado",
  "createdAt", "updatedAt", "createdBy", "updatedBy"
)
VALUES (
  'agenda.site.select',
  'Seleccionar sede al crear agendas',
  'Permite seleccionar una sede activa distinta a la asignada para crear agendas médicas.',
  'agenda',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'migration',
  'migration'
)
ON CONFLICT ("codigo") DO UPDATE SET
  "nombre" = EXCLUDED."nombre",
  "descripcion" = EXCLUDED."descripcion",
  "modulo" = EXCLUDED."modulo",
  "estado" = 1,
  "updatedAt" = CURRENT_TIMESTAMP,
  "updatedBy" = 'migration';

INSERT INTO "perfil_permisos" (
  "perfilId", "permisoId", "permitido",
  "createdAt", "updatedAt", "createdBy", "updatedBy"
)
SELECT profile."id", permission."id", true,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migration', 'migration'
FROM "perfiles" profile
JOIN "permisos" permission ON permission."codigo" = 'agenda.site.select'
WHERE upper(profile."nombre") IN ('ADMIN', 'ADMINISTRADOR')
ON CONFLICT ("perfilId", "permisoId") DO UPDATE SET
  "permitido" = true,
  "updatedAt" = CURRENT_TIMESTAMP,
  "updatedBy" = 'migration';
