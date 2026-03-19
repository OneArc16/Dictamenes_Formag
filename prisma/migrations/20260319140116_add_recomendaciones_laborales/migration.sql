-- CreateEnum
CREATE TYPE "public"."EstadoRecomendacionLaboral" AS ENUM ('BORRADOR', 'CERRADA', 'ANULADA');

-- CreateTable
CREATE TABLE "public"."recomendaciones_laborales" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "empleadoId" INTEGER,
    "numeroRecomendacion" VARCHAR(30),
    "fechaRecomendacion" DATE NOT NULL,
    "peso_kg" DECIMAL(5,2),
    "talla_m" DECIMAL(4,2),
    "imc" DECIMAL(5,2),
    "concepto" TEXT,
    "recomendaciones_observaciones" TEXT,
    "restricciones_laborales" TEXT,
    "estado" "public"."EstadoRecomendacionLaboral" NOT NULL DEFAULT 'BORRADOR',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cerrada_en" TIMESTAMP(3),

    CONSTRAINT "recomendaciones_laborales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recomendacion_laboral_examenes" (
    "id" SERIAL NOT NULL,
    "recomendacion_laboral_id" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "resultado" TEXT,
    "observacion" TEXT,
    "fecha_examen" DATE,
    "orden" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "recomendacion_laboral_examenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recomendacion_laboral_firmas" (
    "id" SERIAL NOT NULL,
    "recomendacion_laboral_id" INTEGER NOT NULL,
    "empleado_id" INTEGER,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "registro_medico" VARCHAR(25),
    "licencia" VARCHAR(30),
    "firma" BYTEA,
    "firma_mime" VARCHAR(50),
    "orden" INTEGER NOT NULL DEFAULT 1,
    "cerrado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recomendacion_laboral_firmas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_usuarioId_idx" ON "public"."recomendaciones_laborales"("usuarioId");

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_empleadoId_idx" ON "public"."recomendaciones_laborales"("empleadoId");

-- CreateIndex
CREATE INDEX "recomendaciones_laborales_estado_fechaRecomendacion_idx" ON "public"."recomendaciones_laborales"("estado", "fechaRecomendacion");

-- CreateIndex
CREATE INDEX "recomendacion_laboral_examenes_recomendacion_laboral_id_idx" ON "public"."recomendacion_laboral_examenes"("recomendacion_laboral_id");

-- CreateIndex
CREATE INDEX "recomendacion_laboral_firmas_recomendacion_laboral_id_idx" ON "public"."recomendacion_laboral_firmas"("recomendacion_laboral_id");

-- CreateIndex
CREATE INDEX "recomendacion_laboral_firmas_empleado_id_idx" ON "public"."recomendacion_laboral_firmas"("empleado_id");

-- CreateIndex
CREATE UNIQUE INDEX "recomendacion_laboral_firmas_recomendacion_laboral_id_orden_key" ON "public"."recomendacion_laboral_firmas"("recomendacion_laboral_id", "orden");

-- AddForeignKey
ALTER TABLE "public"."recomendaciones_laborales" ADD CONSTRAINT "recomendaciones_laborales_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recomendaciones_laborales" ADD CONSTRAINT "recomendaciones_laborales_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "public"."empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recomendacion_laboral_examenes" ADD CONSTRAINT "recomendacion_laboral_examenes_recomendacion_laboral_id_fkey" FOREIGN KEY ("recomendacion_laboral_id") REFERENCES "public"."recomendaciones_laborales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recomendacion_laboral_firmas" ADD CONSTRAINT "recomendacion_laboral_firmas_recomendacion_laboral_id_fkey" FOREIGN KEY ("recomendacion_laboral_id") REFERENCES "public"."recomendaciones_laborales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recomendacion_laboral_firmas" ADD CONSTRAINT "recomendacion_laboral_firmas_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;
