-- Atajos de la pestaña de remisiones: control por medicina laboral y junta médica.
-- Solo se insertan si el CUPS ya está cargado; si no, el atajo se omite sin romper la migración.
INSERT INTO "public"."remision_atajos" ("cupsCodigo", "etiqueta", "orden", "activo")
SELECT c."codigo", v."etiqueta", v."orden", true
FROM (VALUES
  ('890302', 'Control por medicina laboral', 1),
  ('890502', 'Junta médica', 2)
) AS v("codigo", "etiqueta", "orden")
JOIN "public"."cups" c ON c."codigo" = v."codigo"
ON CONFLICT ("cupsCodigo") DO UPDATE
SET "etiqueta" = EXCLUDED."etiqueta", "orden" = EXCLUDED."orden", "activo" = true;
