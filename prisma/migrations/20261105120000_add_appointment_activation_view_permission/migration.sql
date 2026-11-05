INSERT INTO "permisos" (
  "codigo", "nombre", "descripcion", "modulo", "estado",
  "createdAt", "updatedAt", "createdBy", "updatedBy"
)
VALUES (
  'appointment.activation.view',
  'Ver fecha y hora de activación de citas',
  'Permite ver cuándo recepción activó al paciente en Atenciones.',
  'appointment',
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

-- Keep current behavior: administrators and physicians keep seeing the activation time until revoked.
INSERT INTO "perfil_permisos" (
  "perfilId", "permisoId", "permitido",
  "createdAt", "updatedAt", "createdBy", "updatedBy"
)
SELECT profile."id", permission."id", true,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migration', 'migration'
FROM "perfiles" profile
JOIN "permisos" permission ON permission."codigo" = 'appointment.activation.view'
WHERE upper(profile."nombre") IN ('ADMIN', 'ADMINISTRADOR', 'MEDICO')
ON CONFLICT ("perfilId", "permisoId") DO NOTHING;
