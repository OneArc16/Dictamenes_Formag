-- AlterTable
ALTER TABLE "public"."dictamen_deficiencias" ADD COLUMN     "id_nervio" INTEGER;

-- CreateIndex
CREATE INDEX "dictamen_deficiencias_id_nervio_idx" ON "public"."dictamen_deficiencias"("id_nervio");

-- AddForeignKey
ALTER TABLE "public"."dictamen_deficiencias" ADD CONSTRAINT "dictamen_deficiencias_id_nervio_fkey" FOREIGN KEY ("id_nervio") REFERENCES "public"."nervios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
