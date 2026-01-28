/*
  Warnings:

  - Added the required column `updatedAt` to the `dictamenes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- 1) Agregar columna (nullable temporal)
ALTER TABLE "dictamenes"
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- 2) Backfill para filas existentes
UPDATE "dictamenes"
SET "updatedAt" = COALESCE("creadoEn", NOW());

-- 3) Dejarla como requerida
ALTER TABLE "dictamenes"
ALTER COLUMN "updatedAt" SET NOT NULL;

