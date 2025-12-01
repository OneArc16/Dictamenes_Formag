-- CreateEnum
CREATE TYPE "public"."TipoDiagnostico" AS ENUM ('CONFIRMADO_NUEVO', 'IMPRESION_DIAGNOSTICA', 'CONFIRMADO_REPETIDO');

-- AlterTable
ALTER TABLE "public"."dictamen_diagnosticos" ADD COLUMN     "tipo" "public"."TipoDiagnostico" NOT NULL DEFAULT 'IMPRESION_DIAGNOSTICA';
