-- CreateEnum
CREATE TYPE "public"."TratamientoProfesional" AS ENUM ('DR', 'DRA');

-- AlterTable
ALTER TABLE "public"."empleados" ADD COLUMN     "tratamiento" "public"."TratamientoProfesional" NOT NULL DEFAULT 'DR';
