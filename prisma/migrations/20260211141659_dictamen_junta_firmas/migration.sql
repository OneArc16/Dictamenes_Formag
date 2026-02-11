-- AlterTable
ALTER TABLE "public"."empleados" ADD COLUMN     "es_miembro_junta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firma_mime" VARCHAR(50);

-- CreateTable
CREATE TABLE "public"."dictamen_junta" (
    "id" SERIAL NOT NULL,
    "dictamen_id" INTEGER NOT NULL,
    "empleado_id" INTEGER,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "registro_medico" VARCHAR(25),
    "licencia" VARCHAR(30),
    "firma" BYTEA,
    "firma_mime" VARCHAR(50),
    "orden" INTEGER NOT NULL DEFAULT 1,
    "cerrado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dictamen_junta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dictamen_junta_dictamen_id_idx" ON "public"."dictamen_junta"("dictamen_id");

-- CreateIndex
CREATE INDEX "dictamen_junta_empleado_id_idx" ON "public"."dictamen_junta"("empleado_id");

-- CreateIndex
CREATE UNIQUE INDEX "dictamen_junta_dictamen_id_orden_key" ON "public"."dictamen_junta"("dictamen_id", "orden");

-- CreateIndex
CREATE INDEX "empleados_es_miembro_junta_idx" ON "public"."empleados"("es_miembro_junta");

-- AddForeignKey
ALTER TABLE "public"."dictamen_junta" ADD CONSTRAINT "dictamen_junta_dictamen_id_fkey" FOREIGN KEY ("dictamen_id") REFERENCES "public"."dictamenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_junta" ADD CONSTRAINT "dictamen_junta_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;
