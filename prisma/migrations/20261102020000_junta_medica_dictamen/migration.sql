-- La remisión a junta médica registra si es primera vez o recalificación y
-- abre el caso en el panel de Dictamen del médico.
ALTER TABLE "public"."atencion_remisiones" ADD COLUMN "tipoDictamen" "public"."TipoDictamen";

ALTER TABLE "public"."dictamenes" ADD COLUMN "remision_id" INTEGER;
CREATE UNIQUE INDEX "dictamenes_remision_id_key" ON "public"."dictamenes"("remision_id");
ALTER TABLE "public"."dictamenes" ADD CONSTRAINT "dictamenes_remision_id_fkey" FOREIGN KEY ("remision_id") REFERENCES "public"."atencion_remisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
