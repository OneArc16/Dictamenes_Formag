/*
  Warnings:

  - You are about to drop the column `codigoDane` on the `instituciones_educativas` table. All the data in the column will be lost.
  - You are about to drop the column `secretariaId` on the `instituciones_educativas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."instituciones_educativas" DROP CONSTRAINT "instituciones_educativas_secretariaId_fkey";

-- DropIndex
DROP INDEX "public"."instituciones_educativas_codigoDane_key";

-- AlterTable
ALTER TABLE "public"."instituciones_educativas" DROP COLUMN "codigoDane",
DROP COLUMN "secretariaId",
ADD COLUMN     "codigo_ied" VARCHAR(20),
ADD COLUMN     "direccion" VARCHAR(255),
ADD COLUMN     "id_departamento" CHAR(2),
ADD COLUMN     "id_municipio" CHAR(5),
ADD COLUMN     "id_secretaria" INTEGER;

-- CreateIndex
CREATE INDEX "instituciones_educativas_id_departamento_idx" ON "public"."instituciones_educativas"("id_departamento");

-- CreateIndex
CREATE INDEX "instituciones_educativas_id_municipio_idx" ON "public"."instituciones_educativas"("id_municipio");

-- CreateIndex
CREATE INDEX "instituciones_educativas_id_secretaria_idx" ON "public"."instituciones_educativas"("id_secretaria");

-- AddForeignKey
ALTER TABLE "public"."instituciones_educativas" ADD CONSTRAINT "instituciones_educativas_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "public"."departamentos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instituciones_educativas" ADD CONSTRAINT "instituciones_educativas_id_municipio_fkey" FOREIGN KEY ("id_municipio") REFERENCES "public"."municipios"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instituciones_educativas" ADD CONSTRAINT "instituciones_educativas_id_secretaria_fkey" FOREIGN KEY ("id_secretaria") REFERENCES "public"."secretarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
