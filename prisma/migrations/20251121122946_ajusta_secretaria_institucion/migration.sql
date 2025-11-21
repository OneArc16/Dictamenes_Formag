/*
  Warnings:

  - You are about to drop the column `codigo` on the `secretarias` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."secretarias_codigo_key";

-- AlterTable
ALTER TABLE "public"."secretarias" DROP COLUMN "codigo";
