/*
  Warnings:

  - You are about to drop the column `concepto` on the `recomendaciones_laborales` table. All the data in the column will be lost.
  - You are about to drop the column `recomendaciones_observaciones` on the `recomendaciones_laborales` table. All the data in the column will be lost.
  - You are about to drop the column `restricciones_laborales` on the `recomendaciones_laborales` table. All the data in the column will be lost.
  - You are about to drop the `recomendacion_laboral_examenes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."recomendacion_laboral_examenes" DROP CONSTRAINT "recomendacion_laboral_examenes_recomendacion_laboral_id_fkey";

-- AlterTable
ALTER TABLE "public"."recomendaciones_laborales" DROP COLUMN "concepto",
DROP COLUMN "recomendaciones_observaciones",
DROP COLUMN "restricciones_laborales",
ADD COLUMN     "examenes_realizados" TEXT,
ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "recomendaciones_observaciones_restricciones" TEXT;

-- DropTable
DROP TABLE "public"."recomendacion_laboral_examenes";
