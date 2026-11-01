-- Incapacidades que el médico expide al docente durante la atención.
CREATE TYPE "public"."CategoriaIncapacidad" AS ENUM ('ENFERMEDAD_GENERAL', 'ENFERMEDAD_PROFESIONAL', 'ACCIDENTE_LABORAL', 'ACCIDENTE_NO_LABORAL', 'INCAPACIDAD_MATERNA', 'LEY_MARIA');

CREATE TABLE "public"."atencion_incapacidades" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "numeroInterno" VARCHAR(20) NOT NULL,
    "categoria" "public"."CategoriaIncapacidad" NOT NULL,
    "prorroga" BOOLEAN NOT NULL DEFAULT false,
    "prorrogaDeId" INTEGER,
    "diagnosticoCodigo" VARCHAR(10) NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "dias" SMALLINT NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "atencion_incapacidades_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "atencion_incapacidades_dias_check" CHECK ("dias" > 0),
    CONSTRAINT "atencion_incapacidades_fechas_check" CHECK ("fechaFin" = "fechaInicio" + ("dias" - 1)),
    CONSTRAINT "atencion_incapacidades_prorroga_check" CHECK ("prorroga" = ("prorrogaDeId" IS NOT NULL))
);

CREATE UNIQUE INDEX "atencion_incapacidades_numeroInterno_key" ON "public"."atencion_incapacidades"("numeroInterno");
CREATE INDEX "atencion_incapacidades_citaId_idx" ON "public"."atencion_incapacidades"("citaId");
CREATE INDEX "atencion_incapacidades_usuarioId_fechaInicio_idx" ON "public"."atencion_incapacidades"("usuarioId", "fechaInicio");
CREATE INDEX "atencion_incapacidades_prorrogaDeId_idx" ON "public"."atencion_incapacidades"("prorrogaDeId");

ALTER TABLE "public"."atencion_incapacidades" ADD CONSTRAINT "atencion_incapacidades_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."atencion_incapacidades" ADD CONSTRAINT "atencion_incapacidades_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."atencion_incapacidades" ADD CONSTRAINT "atencion_incapacidades_diagnosticoCodigo_fkey" FOREIGN KEY ("diagnosticoCodigo") REFERENCES "public"."cie10"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."atencion_incapacidades" ADD CONSTRAINT "atencion_incapacidades_prorrogaDeId_fkey" FOREIGN KEY ("prorrogaDeId") REFERENCES "public"."atencion_incapacidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
