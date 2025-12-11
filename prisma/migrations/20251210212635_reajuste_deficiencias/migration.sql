/*
  Warnings:

  - You are about to drop the column `codigo` on the `deficiencias` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `deficiencias` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `deficiencias` table. All the data in the column will be lost.
  - You are about to drop the column `notas` on the `deficiencias` table. All the data in the column will be lost.
  - You are about to drop the column `sistemaCorporal` on the `deficiencias` table. All the data in the column will be lost.
  - You are about to drop the column `uiPolitica` on the `deficiencias` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `deficiencias` table. All the data in the column will be lost.
  - You are about to alter the column `nombre` on the `deficiencias` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `criterio_opciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `criterio_rangos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deficiencia_criterios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deficiencia_reglas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dictamen_entradas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `regla_condiciones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."criterio_opciones" DROP CONSTRAINT "criterio_opciones_criterioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."criterio_rangos" DROP CONSTRAINT "criterio_rangos_criterioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."deficiencia_criterios" DROP CONSTRAINT "deficiencia_criterios_deficienciaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."deficiencia_reglas" DROP CONSTRAINT "deficiencia_reglas_deficienciaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dictamen_entradas" DROP CONSTRAINT "dictamen_entradas_criterioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dictamen_entradas" DROP CONSTRAINT "dictamen_entradas_dictamenDeficienciaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dictamen_entradas" DROP CONSTRAINT "dictamen_entradas_opcionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dictamen_entradas" DROP CONSTRAINT "dictamen_entradas_rangoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dictamen_entradas" DROP CONSTRAINT "dictamen_entradas_reglaCoincidenteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."regla_condiciones" DROP CONSTRAINT "regla_condiciones_criterioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."regla_condiciones" DROP CONSTRAINT "regla_condiciones_opcionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."regla_condiciones" DROP CONSTRAINT "regla_condiciones_rangoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."regla_condiciones" DROP CONSTRAINT "regla_condiciones_reglaId_fkey";

-- DropIndex
DROP INDEX "public"."deficiencias_codigo_key";

-- AlterTable
ALTER TABLE "public"."deficiencias" DROP COLUMN "codigo",
DROP COLUMN "creadoEn",
DROP COLUMN "estado",
DROP COLUMN "notas",
DROP COLUMN "sistemaCorporal",
DROP COLUMN "uiPolitica",
DROP COLUMN "version",
ADD COLUMN     "capitulo" VARCHAR(20),
ADD COLUMN     "decreto" VARCHAR(50),
ADD COLUMN     "tabla" DECIMAL(4,2) NOT NULL DEFAULT 0.0,
ADD COLUMN     "tipo_tabla" VARCHAR(50),
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(255);

-- DropTable
DROP TABLE "public"."criterio_opciones";

-- DropTable
DROP TABLE "public"."criterio_rangos";

-- DropTable
DROP TABLE "public"."deficiencia_criterios";

-- DropTable
DROP TABLE "public"."deficiencia_reglas";

-- DropTable
DROP TABLE "public"."dictamen_entradas";

-- DropTable
DROP TABLE "public"."regla_condiciones";

-- CreateTable
CREATE TABLE "public"."nervios" (
    "id" SERIAL NOT NULL,
    "deficienciaId" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "motor_a" DECIMAL(6,2),
    "sensitivo_a" DECIMAL(6,2),
    "mixto_a" DECIMAL(6,2),
    "motor_b" DECIMAL(6,2),
    "sensitivo_b" DECIMAL(6,2),
    "mixto_b" DECIMAL(6,2),
    "orden" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "nervios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clases" (
    "id" SERIAL NOT NULL,
    "deficienciaId" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "procedimiento_a" DECIMAL(6,2),
    "procedimiento_b" DECIMAL(6,2),
    "orden" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "clases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movimientos" (
    "id" SERIAL NOT NULL,
    "deficienciaId" INTEGER NOT NULL,
    "tipo_movimiento" VARCHAR(255) NOT NULL,
    "rango_inicial" DECIMAL(6,2),
    "rango_final" DECIMAL(6,2),
    "restriccion_a" DECIMAL(6,2),
    "restriccion_b" DECIMAL(6,2),
    "anquilosis_a" DECIMAL(6,2),
    "anquilosis_b" DECIMAL(6,2),
    "grupo" VARCHAR(100),
    "orden" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nervios_deficienciaId_idx" ON "public"."nervios"("deficienciaId");

-- CreateIndex
CREATE INDEX "clases_deficienciaId_idx" ON "public"."clases"("deficienciaId");

-- CreateIndex
CREATE INDEX "movimientos_deficienciaId_idx" ON "public"."movimientos"("deficienciaId");

-- AddForeignKey
ALTER TABLE "public"."nervios" ADD CONSTRAINT "nervios_deficienciaId_fkey" FOREIGN KEY ("deficienciaId") REFERENCES "public"."deficiencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clases" ADD CONSTRAINT "clases_deficienciaId_fkey" FOREIGN KEY ("deficienciaId") REFERENCES "public"."deficiencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimientos" ADD CONSTRAINT "movimientos_deficienciaId_fkey" FOREIGN KEY ("deficienciaId") REFERENCES "public"."deficiencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
