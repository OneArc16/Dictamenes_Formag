-- La prórroga puede ser de una incapacidad del sistema o de una externa
-- (otra entidad), de la que se registra su número y su fecha de fin.
ALTER TABLE "public"."atencion_incapacidades"
  ADD COLUMN "prorrogaExternaNumero" VARCHAR(40),
  ADD COLUMN "prorrogaExternaFin" DATE;

ALTER TABLE "public"."atencion_incapacidades" DROP CONSTRAINT "atencion_incapacidades_prorroga_check";
ALTER TABLE "public"."atencion_incapacidades" ADD CONSTRAINT "atencion_incapacidades_prorroga_check" CHECK (
  ("prorrogaExternaNumero" IS NULL) = ("prorrogaExternaFin" IS NULL)
  AND "prorroga" = ("prorrogaDeId" IS NOT NULL OR "prorrogaExternaNumero" IS NOT NULL)
  AND NOT ("prorrogaDeId" IS NOT NULL AND "prorrogaExternaNumero" IS NOT NULL)
);
