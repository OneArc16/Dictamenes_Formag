-- CreateEnum
CREATE TYPE "public"."MovimientoModo" AS ENUM ('RESTRICCION', 'ANQUILOSIS');

-- CreateTable
CREATE TABLE "public"."dictamen_deficiencia_movimientos" (
    "id" SERIAL NOT NULL,
    "dictamen_deficiencia_id" INTEGER NOT NULL,
    "movimiento_id" INTEGER NOT NULL,
    "tipo_movimiento" VARCHAR(255) NOT NULL,
    "modo" "public"."MovimientoModo" NOT NULL,
    "valor" DECIMAL(6,2),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dictamen_deficiencia_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dictamen_deficiencia_movimientos_dictamen_deficiencia_id_idx" ON "public"."dictamen_deficiencia_movimientos"("dictamen_deficiencia_id");

-- CreateIndex
CREATE INDEX "dictamen_deficiencia_movimientos_movimiento_id_idx" ON "public"."dictamen_deficiencia_movimientos"("movimiento_id");

-- CreateIndex
CREATE UNIQUE INDEX "dictamen_deficiencia_movimientos_dictamen_deficiencia_id_ti_key" ON "public"."dictamen_deficiencia_movimientos"("dictamen_deficiencia_id", "tipo_movimiento");

-- AddForeignKey
ALTER TABLE "public"."dictamen_deficiencia_movimientos" ADD CONSTRAINT "dictamen_deficiencia_movimientos_dictamen_deficiencia_id_fkey" FOREIGN KEY ("dictamen_deficiencia_id") REFERENCES "public"."dictamen_deficiencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_deficiencia_movimientos" ADD CONSTRAINT "dictamen_deficiencia_movimientos_movimiento_id_fkey" FOREIGN KEY ("movimiento_id") REFERENCES "public"."movimientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
