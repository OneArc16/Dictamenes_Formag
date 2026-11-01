-- La prórroga es solo una marca sí/no: no se registra la incapacidad anterior.
ALTER TABLE "public"."atencion_incapacidades" DROP CONSTRAINT "atencion_incapacidades_prorroga_check";
ALTER TABLE "public"."atencion_incapacidades" DROP CONSTRAINT "atencion_incapacidades_prorrogaDeId_fkey";
DROP INDEX "public"."atencion_incapacidades_prorrogaDeId_idx";
ALTER TABLE "public"."atencion_incapacidades"
  DROP COLUMN "prorrogaDeId",
  DROP COLUMN "prorrogaExternaNumero",
  DROP COLUMN "prorrogaExternaFin";
