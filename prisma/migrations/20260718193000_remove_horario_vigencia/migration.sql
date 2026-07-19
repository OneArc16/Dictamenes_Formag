-- El horario laboral es una plantilla semanal activa. El rango de fechas
-- pertenece exclusivamente a cada generación de agenda.

ALTER TABLE "public"."horarios_laborales"
  DROP CONSTRAINT IF EXISTS "horarios_laborales_sede_vigencia_excl";
ALTER TABLE "public"."horarios_laborales"
  DROP CONSTRAINT IF EXISTS "horarios_laborales_medico_vigencia_excl";

DROP INDEX IF EXISTS "public"."horarios_laborales_sedeId_activo_vigencia_idx";
DROP INDEX IF EXISTS "public"."horarios_laborales_medicoId_activo_vigencia_idx";

-- Si ya existen varias configuraciones activas para un mismo alcance,
-- conservar únicamente la más recientemente actualizada.
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "sedeId"
      ORDER BY "updatedAt" DESC, "id" DESC
    ) AS position
  FROM "public"."horarios_laborales"
  WHERE "activo" = true AND "medicoId" IS NULL
)
UPDATE "public"."horarios_laborales" AS schedule
SET
  "activo" = false,
  "updatedAt" = CURRENT_TIMESTAMP,
  "updatedBy" = 'migration-remove-vigencia'
FROM ranked
WHERE schedule."id" = ranked."id" AND ranked.position > 1;

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "medicoId"
      ORDER BY "updatedAt" DESC, "id" DESC
    ) AS position
  FROM "public"."horarios_laborales"
  WHERE "activo" = true AND "medicoId" IS NOT NULL
)
UPDATE "public"."horarios_laborales" AS schedule
SET
  "activo" = false,
  "updatedAt" = CURRENT_TIMESTAMP,
  "updatedBy" = 'migration-remove-vigencia'
FROM ranked
WHERE schedule."id" = ranked."id" AND ranked.position > 1;

ALTER TABLE "public"."horarios_laborales"
  DROP CONSTRAINT IF EXISTS "horarios_laborales_vigencia_check";
ALTER TABLE "public"."horarios_laborales"
  DROP COLUMN "vigenteDesde",
  DROP COLUMN "vigenteHasta";

CREATE INDEX "horarios_laborales_sedeId_activo_idx"
  ON "public"."horarios_laborales"("sedeId", "activo");
CREATE INDEX "horarios_laborales_medicoId_activo_idx"
  ON "public"."horarios_laborales"("medicoId", "activo");

CREATE UNIQUE INDEX "horarios_laborales_sede_activo_unique"
  ON "public"."horarios_laborales"("sedeId")
  WHERE "activo" = true AND "medicoId" IS NULL;
CREATE UNIQUE INDEX "horarios_laborales_medico_activo_unique"
  ON "public"."horarios_laborales"("medicoId")
  WHERE "activo" = true AND "medicoId" IS NOT NULL;
