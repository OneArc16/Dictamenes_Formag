-- Historial de cancelaciones y reversiones de cupos médicos.
-- Solo incluye este cambio: `migrate dev` también proponía renombrar índices de migraciones
-- anteriores (nombres escritos a mano), lo que no corresponde a esta migración.

-- CreateEnum
CREATE TYPE "public"."TipoEventoCupoMedico" AS ENUM ('CANCELADO', 'RESTAURADO');

-- CreateTable
CREATE TABLE "public"."cupos_medicos_historial" (
    "id" SERIAL NOT NULL,
    "cupoMedicoId" INTEGER NOT NULL,
    "tipoEvento" "public"."TipoEventoCupoMedico" NOT NULL,
    "estadoAnterior" "public"."EstadoCupoMedico" NOT NULL,
    "estadoNuevo" "public"."EstadoCupoMedico" NOT NULL,
    "motivo" VARCHAR(500),
    "actorEmpleadoId" INTEGER NOT NULL,
    "actorNombre" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "cupos_medicos_historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cupos_medicos_historial_cupoMedicoId_createdAt_idx" ON "public"."cupos_medicos_historial"("cupoMedicoId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."cupos_medicos_historial" ADD CONSTRAINT "cupos_medicos_historial_cupoMedicoId_fkey" FOREIGN KEY ("cupoMedicoId") REFERENCES "public"."cupos_medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
