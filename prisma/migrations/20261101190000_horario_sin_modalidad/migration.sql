-- El horario laboral es compartido por todas las modalidades: la modalidad
-- vive en la generación y en los cupos, no en el horario.

-- Si quedaron dos horarios activos para el mismo alcance (uno por modalidad),
-- se conserva el más antiguo y los demás se desactivan.
UPDATE "public"."horarios_laborales" h
SET "activo" = false, "updatedAt" = CURRENT_TIMESTAMP, "updatedBy" = 'migracion-horario-sin-modalidad'
WHERE h."activo" = true AND EXISTS (
  SELECT 1 FROM "public"."horarios_laborales" o
  WHERE o."activo" = true AND o."id" < h."id" AND (
    (h."medicoId" IS NULL AND o."medicoId" IS NULL AND o."sedeId" = h."sedeId")
    OR (h."medicoId" IS NOT NULL AND o."medicoId" = h."medicoId")
  )
);

DROP INDEX "public"."horarios_laborales_sede_activo_unique";
DROP INDEX "public"."horarios_laborales_medico_activo_unique";
CREATE UNIQUE INDEX "horarios_laborales_sede_activo_unique"
  ON "public"."horarios_laborales"("sedeId")
  WHERE "activo" = true AND "medicoId" IS NULL;
CREATE UNIQUE INDEX "horarios_laborales_medico_activo_unique"
  ON "public"."horarios_laborales"("medicoId")
  WHERE "activo" = true AND "medicoId" IS NOT NULL;

ALTER TABLE "public"."horarios_laborales" DROP CONSTRAINT "horarios_laborales_modalidadId_fkey";
DROP INDEX "public"."horarios_laborales_modalidadId_idx";
ALTER TABLE "public"."horarios_laborales" DROP COLUMN "modalidadId";
