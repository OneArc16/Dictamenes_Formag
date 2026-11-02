-- Copia de la identificación del paciente, del médico y de la sede al finalizar la atención.
-- Nullable: las atenciones ya finalizadas no tienen copia y siguen leyendo los datos actuales.
ALTER TABLE "atenciones" ADD COLUMN "datos_registro" JSONB;
