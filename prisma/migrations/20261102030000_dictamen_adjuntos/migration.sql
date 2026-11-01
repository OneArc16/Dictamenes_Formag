-- CreateTable
CREATE TABLE "dictamenes_adjuntos" (
    "id" SERIAL NOT NULL,
    "dictamen_id" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "tamano" INTEGER NOT NULL,
    "contenido" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100),

    CONSTRAINT "dictamenes_adjuntos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dictamenes_adjuntos_dictamen_id_idx" ON "dictamenes_adjuntos"("dictamen_id");

-- AddForeignKey
ALTER TABLE "dictamenes_adjuntos" ADD CONSTRAINT "dictamenes_adjuntos_dictamen_id_fkey" FOREIGN KEY ("dictamen_id") REFERENCES "dictamenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
