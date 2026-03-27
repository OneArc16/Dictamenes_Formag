-- CreateEnum
CREATE TYPE "public"."TipoHistorialDictamen" AS ENUM ('REAPERTURA', 'EDICION', 'CIERRE');

-- CreateEnum
CREATE TYPE "public"."EstadoHistorialDictamen" AS ENUM ('PENDIENTE', 'REABIERTO', 'CERRADO');

-- AlterTable
ALTER TABLE "public"."dictamenes" ADD COLUMN     "motivo_reapertura_id" INTEGER,
ADD COLUMN     "reabierto_en" TIMESTAMP(3),
ADD COLUMN     "reabierto_por_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."dictamenes_historial" (
    "id" SERIAL NOT NULL,
    "dictamen_id" INTEGER NOT NULL,
    "empleado_id" INTEGER,
    "motivo_reapertura_id" INTEGER,
    "tipo" "public"."TipoHistorialDictamen" NOT NULL,
    "estado_anterior" "public"."EstadoHistorialDictamen",
    "estado_nuevo" "public"."EstadoHistorialDictamen",
    "formulario_anterior" JSONB,
    "formulario_nuevo" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dictamenes_historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dictamenes_historial_dictamen_id_idx" ON "public"."dictamenes_historial"("dictamen_id");

-- CreateIndex
CREATE INDEX "dictamenes_historial_empleado_id_idx" ON "public"."dictamenes_historial"("empleado_id");

-- CreateIndex
CREATE INDEX "dictamenes_historial_motivo_reapertura_id_idx" ON "public"."dictamenes_historial"("motivo_reapertura_id");

-- CreateIndex
CREATE INDEX "dictamenes_historial_tipo_created_at_idx" ON "public"."dictamenes_historial"("tipo", "created_at");

-- CreateIndex
CREATE INDEX "dictamenes_reabierto_por_id_idx" ON "public"."dictamenes"("reabierto_por_id");

-- CreateIndex
CREATE INDEX "dictamenes_motivo_reapertura_id_idx" ON "public"."dictamenes"("motivo_reapertura_id");

-- AddForeignKey
ALTER TABLE "public"."dictamenes" ADD CONSTRAINT "dictamenes_reabierto_por_id_fkey" FOREIGN KEY ("reabierto_por_id") REFERENCES "public"."empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamenes" ADD CONSTRAINT "dictamenes_motivo_reapertura_id_fkey" FOREIGN KEY ("motivo_reapertura_id") REFERENCES "public"."motivos_reapertura_recomendacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamenes_historial" ADD CONSTRAINT "dictamenes_historial_dictamen_id_fkey" FOREIGN KEY ("dictamen_id") REFERENCES "public"."dictamenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamenes_historial" ADD CONSTRAINT "dictamenes_historial_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamenes_historial" ADD CONSTRAINT "dictamenes_historial_motivo_reapertura_id_fkey" FOREIGN KEY ("motivo_reapertura_id") REFERENCES "public"."motivos_reapertura_recomendacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
