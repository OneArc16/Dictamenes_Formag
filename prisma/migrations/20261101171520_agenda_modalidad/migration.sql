-- Agenda por modalidad: cada horario, generación y cupo pertenece a una
-- modalidad (Presencial / Teleconsulta). Se omiten los renombres de índices que
-- propone `migrate dev`, porque esos nombres se escribieron a mano en
-- migraciones anteriores.

-- Los triggers diferidos de cupos dejarían eventos pendientes tras el UPDATE y
-- bloquearían el ALTER TABLE siguiente; se evalúan de inmediato.
SET CONSTRAINTS ALL IMMEDIATE;

-- Garantiza el catálogo antes de rellenar (ya lo crea add_patient_reception).
INSERT INTO "public"."modalidades_cita" ("codigo", "nombre", "updatedAt")
VALUES ('PRESENCIAL', 'Presencial', CURRENT_TIMESTAMP),
       ('TELECONSULTA', 'Teleconsulta', CURRENT_TIMESTAMP)
ON CONFLICT ("codigo") DO NOTHING;

-- Columnas: se agregan nulas, se rellenan como PRESENCIAL y luego se exigen.
ALTER TABLE "public"."horarios_laborales" ADD COLUMN "modalidadId" INTEGER;
ALTER TABLE "public"."generaciones_agenda" ADD COLUMN "modalidadId" INTEGER;
ALTER TABLE "public"."cupos_medicos" ADD COLUMN "modalidadId" INTEGER;

UPDATE "public"."horarios_laborales"
SET "modalidadId" = (SELECT "id" FROM "public"."modalidades_cita" WHERE "codigo" = 'PRESENCIAL');
UPDATE "public"."generaciones_agenda"
SET "modalidadId" = (SELECT "id" FROM "public"."modalidades_cita" WHERE "codigo" = 'PRESENCIAL');
UPDATE "public"."cupos_medicos"
SET "modalidadId" = (SELECT "id" FROM "public"."modalidades_cita" WHERE "codigo" = 'PRESENCIAL');
-- Un cupo con cita vigente conserva la modalidad con la que se agendó.
UPDATE "public"."cupos_medicos" s
SET "modalidadId" = c."modalidadId"
FROM "public"."citas" c
WHERE c."cupoMedicoId" = s."id" AND c."estado" IN ('ASIGNADA', 'ATENDIDA');

ALTER TABLE "public"."horarios_laborales" ALTER COLUMN "modalidadId" SET NOT NULL;
ALTER TABLE "public"."generaciones_agenda" ALTER COLUMN "modalidadId" SET NOT NULL;
ALTER TABLE "public"."cupos_medicos" ALTER COLUMN "modalidadId" SET NOT NULL;

ALTER TABLE "public"."horarios_laborales" ADD CONSTRAINT "horarios_laborales_modalidadId_fkey"
  FOREIGN KEY ("modalidadId") REFERENCES "public"."modalidades_cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."generaciones_agenda" ADD CONSTRAINT "generaciones_agenda_modalidadId_fkey"
  FOREIGN KEY ("modalidadId") REFERENCES "public"."modalidades_cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."cupos_medicos" ADD CONSTRAINT "cupos_medicos_modalidadId_fkey"
  FOREIGN KEY ("modalidadId") REFERENCES "public"."modalidades_cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "horarios_laborales_modalidadId_idx" ON "public"."horarios_laborales"("modalidadId");
CREATE INDEX "generaciones_agenda_modalidadId_idx" ON "public"."generaciones_agenda"("modalidadId");
CREATE INDEX "cupos_medicos_sedeId_modalidadId_inicio_estado_idx"
  ON "public"."cupos_medicos"("sedeId", "modalidadId", "inicio", "estado");

-- Un horario activo por (sede, modalidad) y por (médico, modalidad).
DROP INDEX "public"."horarios_laborales_sede_activo_unique";
DROP INDEX "public"."horarios_laborales_medico_activo_unique";
CREATE UNIQUE INDEX "horarios_laborales_sede_activo_unique"
  ON "public"."horarios_laborales"("sedeId", "modalidadId")
  WHERE "activo" = true AND "medicoId" IS NULL;
CREATE UNIQUE INDEX "horarios_laborales_medico_activo_unique"
  ON "public"."horarios_laborales"("medicoId", "modalidadId")
  WHERE "activo" = true AND "medicoId" IS NOT NULL;

-- La cita vigente debe tener la misma modalidad que su cupo.
CREATE OR REPLACE FUNCTION assert_reception_appointment_slot_consistency()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "citas" c
    JOIN "cupos_medicos" s ON s."id" = c."cupoMedicoId"
    WHERE c."estado" IN ('ASIGNADA', 'ATENDIDA') AND s."estado" <> 'ASIGNADO'
  ) THEN
    RAISE EXCEPTION 'Una cita vigente debe referenciar un cupo asignado';
  END IF;
  IF EXISTS (
    SELECT 1 FROM "cupos_medicos" s
    WHERE s."estado" = 'ASIGNADO' AND NOT EXISTS (
      SELECT 1 FROM "citas" c WHERE c."cupoMedicoId" = s."id" AND c."estado" IN ('ASIGNADA', 'ATENDIDA')
    )
  ) THEN
    RAISE EXCEPTION 'Un cupo asignado debe tener una cita vigente';
  END IF;
  IF EXISTS (
    SELECT 1 FROM "citas" c
    JOIN "cupos_medicos" s ON s."id" = c."cupoMedicoId"
    WHERE c."estado" IN ('ASIGNADA', 'ATENDIDA') AND c."modalidadId" <> s."modalidadId"
  ) THEN
    RAISE EXCEPTION 'La modalidad de la cita debe coincidir con la de su cupo';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
