-- CreateTable
CREATE TABLE "public"."atencion_diagnosticos" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER NOT NULL,
    "orden" SMALLINT NOT NULL,
    "cie10Codigo" VARCHAR(10) NOT NULL,
    "tipo" "public"."TipoDiagnostico" NOT NULL DEFAULT 'IMPRESION_DIAGNOSTICA',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "atencion_diagnosticos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "atencion_diagnosticos_cie10Codigo_idx" ON "public"."atencion_diagnosticos"("cie10Codigo");

-- CreateIndex
CREATE UNIQUE INDEX "atencion_diagnosticos_citaId_orden_key" ON "public"."atencion_diagnosticos"("citaId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "atencion_diagnosticos_citaId_cie10Codigo_key" ON "public"."atencion_diagnosticos"("citaId", "cie10Codigo");


-- AddForeignKey
ALTER TABLE "public"."atencion_diagnosticos" ADD CONSTRAINT "atencion_diagnosticos_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atencion_diagnosticos" ADD CONSTRAINT "atencion_diagnosticos_cie10Codigo_fkey" FOREIGN KEY ("cie10Codigo") REFERENCES "public"."cie10"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
