-- AlterTable
ALTER TABLE "public"."atenciones" ADD COLUMN     "examenFisico" JSONB;

-- AlterTable
ALTER TABLE "public"."signos_vitales" ADD COLUMN     "perimetroCadera" DECIMAL(5,1),
ADD COLUMN     "perimetroCintura" DECIMAL(5,1);
