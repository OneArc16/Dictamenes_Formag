-- DropIndex
DROP INDEX "public"."dictamen_deficiencias_dictamenId_deficienciaId_key";

-- CreateIndex
CREATE INDEX "dictamen_deficiencias_dictamenId_idx" ON "public"."dictamen_deficiencias"("dictamenId");
