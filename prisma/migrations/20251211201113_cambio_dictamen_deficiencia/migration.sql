/*
  Warnings:

  - You are about to drop the column `procedimiento` on the `dictamen_deficiencias` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."dictamen_deficiencias" DROP COLUMN "procedimiento",
ADD COLUMN     "id_clase" INTEGER;

-- CreateIndex
CREATE INDEX "dictamen_deficiencias_id_clase_idx" ON "public"."dictamen_deficiencias"("id_clase");

-- AddForeignKey
ALTER TABLE "public"."dictamen_deficiencias" ADD CONSTRAINT "dictamen_deficiencias_id_clase_fkey" FOREIGN KEY ("id_clase") REFERENCES "public"."clases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
