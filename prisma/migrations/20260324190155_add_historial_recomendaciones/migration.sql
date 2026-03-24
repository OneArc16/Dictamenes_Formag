-- CreateEnum
CREATE TYPE "public"."TipoHistorialRecomendacionLaboral" AS ENUM ('REAPERTURA', 'EDICION', 'CIERRE');

-- AlterEnum
ALTER TYPE "public"."EstadoRecomendacionLaboral" ADD VALUE 'REABIERTO';

-- AlterTable
ALTER TABLE "public"."recomendaciones_laborales" ADD COLUMN     "motivo_reapertura_id" INTEGER,
ADD COLUMN     "reabierta_en" TIMESTAMP(3),
ADD COLUMN     "reabierta_por_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."recomendaciones_laborales_historial" (
    "id" SERIAL NOT NULL,
    "recomendacion_laboral_id" INTEGER NOT NULL,
    "empleado_id" INTEGER,
    "motivo_reapertura_id" INTEGER,
    "tipo" "public"."TipoHistorialRecomendacionLaboral" NOT NULL,
    "estado_anterior" "public"."EstadoRecomendacionLaboral",
    "estado_nuevo" "public"."EstadoRecomendacionLaboral",
    "formulario_anterior" JSONB,
    "formulario_nuevo" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recomendaciones_laborales_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."motivos_reapertura_recomendacion" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20),
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),

    CONSTRAINT "motivos_reapertura_recomendacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_historial_recomendacion_laboral_i_idx" ON "public"."recomendaciones_laborales_historial"("recomendacion_laboral_id");

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_historial_empleado_id_idx" ON "public"."recomendaciones_laborales_historial"("empleado_id");

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_historial_motivo_reapertura_id_idx" ON "public"."recomendaciones_laborales_historial"("motivo_reapertura_id");

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_historial_tipo_created_at_idx" ON "public"."recomendaciones_laborales_historial"("tipo", "created_at");

-- CreateIndex
CREATE INDEX "motivos_reapertura_recomendacion_codigo_idx" ON "public"."motivos_reapertura_recomendacion"("codigo");

-- CreateIndex
CREATE INDEX "motivos_reapertura_recomendacion_estado_orden_idx" ON "public"."motivos_reapertura_recomendacion"("estado", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "motivos_reapertura_recomendacion_nombre_key" ON "public"."motivos_reapertura_recomendacion"("nombre");

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_reabierta_por_id_idx" ON "public"."recomendaciones_laborales"("reabierta_por_id");

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_motivo_reapertura_id_idx" ON "public"."recomendaciones_laborales"("motivo_reapertura_id");

-- AddForeignKey
ALTER TABLE "public"."recomendaciones_laborales" ADD CONSTRAINT "recomendaciones_laborales_reabierta_por_id_fkey" FOREIGN KEY ("reabierta_por_id") REFERENCES "public"."empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recomendaciones_laborales" ADD CONSTRAINT "recomendaciones_laborales_motivo_reapertura_id_fkey" FOREIGN KEY ("motivo_reapertura_id") REFERENCES "public"."motivos_reapertura_recomendacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recomendaciones_laborales_historial" ADD CONSTRAINT "recomendaciones_laborales_historial_recomendacion_laboral__fkey" FOREIGN KEY ("recomendacion_laboral_id") REFERENCES "public"."recomendaciones_laborales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recomendaciones_laborales_historial" ADD CONSTRAINT "recomendaciones_laborales_historial_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recomendaciones_laborales_historial" ADD CONSTRAINT "recomendaciones_laborales_historial_motivo_reapertura_id_fkey" FOREIGN KEY ("motivo_reapertura_id") REFERENCES "public"."motivos_reapertura_recomendacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
