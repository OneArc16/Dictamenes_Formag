INSERT INTO "motivos_reapertura_alcances" ("motivo_reapertura_id", "alcance")
SELECT "id", 'ORIGEN'::"AlcanceMotivoReapertura"
FROM "motivos_reapertura_recomendacion"
ON CONFLICT DO NOTHING;
