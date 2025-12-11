/*
  Warnings:

  - You are about to drop the column `porcentajeResultado` on the `dictamen_deficiencias` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."dictamen_deficiencias" DROP COLUMN "porcentajeResultado",
ADD COLUMN     "valorDeficiencia" DECIMAL(6,2);
