-- CreateEnum
CREATE TYPE "public"."DictamenTipoEvento" AS ENUM ('ENFERMEDAD', 'ACCIDENTE');

-- CreateEnum
CREATE TYPE "public"."DictamenOrigenEvento" AS ENUM ('LABORAL', 'COMUN');

-- AlterTable
ALTER TABLE "public"."dictamenes" ADD COLUMN     "fechaEstructuracionInvalidez" TIMESTAMP(3),
ADD COLUMN     "origenEvento" "public"."DictamenOrigenEvento",
ADD COLUMN     "tipoEvento" "public"."DictamenTipoEvento";
