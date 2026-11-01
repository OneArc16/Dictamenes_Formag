-- Los adjuntos pasan a guardarse en disco; la tabla estaba vacía.
DELETE FROM "dictamenes_adjuntos";
ALTER TABLE "dictamenes_adjuntos" DROP COLUMN "contenido";
ALTER TABLE "dictamenes_adjuntos" ADD COLUMN "ruta_archivo" VARCHAR(255) NOT NULL;
