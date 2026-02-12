-- CreateEnum
CREATE TYPE "public"."TipoDictamen" AS ENUM ('CALIFICACION', 'RECALIFICACION');

-- AlterTable
ALTER TABLE "public"."dictamenes" ADD COLUMN     "tipo_dictamen" "public"."TipoDictamen" NOT NULL DEFAULT 'CALIFICACION';

-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "fecha_vinculacion" DATE;

-- CreateIndex
CREATE INDEX "dictamenes_tipo_dictamen_idx" ON "public"."dictamenes"("tipo_dictamen");
