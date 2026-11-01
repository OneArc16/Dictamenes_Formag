-- La incapacidad muestra todos los diagnósticos de su atención en lugar de
-- guardar uno propio.
ALTER TABLE "public"."atencion_incapacidades" DROP CONSTRAINT "atencion_incapacidades_diagnosticoCodigo_fkey";
ALTER TABLE "public"."atencion_incapacidades" DROP COLUMN "diagnosticoCodigo";
