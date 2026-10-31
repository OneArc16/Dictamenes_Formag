-- CreateTable
CREATE TABLE "public"."cups" (
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(500) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cups_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."remision_atajos" (
    "cupsCodigo" VARCHAR(10) NOT NULL,
    "etiqueta" VARCHAR(80) NOT NULL,
    "orden" SMALLINT NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "remision_atajos_pkey" PRIMARY KEY ("cupsCodigo")
);

-- CreateTable
CREATE TABLE "public"."atencion_remisiones" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "cupsCodigo" VARCHAR(10) NOT NULL,
    "diagnosticoCodigo" VARCHAR(10) NOT NULL,
    "relacionado2Codigo" VARCHAR(10),
    "relacionado3Codigo" VARCHAR(10),
    "motivo" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "atencion_remisiones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "atencion_remisiones_usuarioId_createdAt_idx" ON "public"."atencion_remisiones"("usuarioId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "atencion_remisiones_citaId_cupsCodigo_key" ON "public"."atencion_remisiones"("citaId", "cupsCodigo");

-- AddForeignKey
ALTER TABLE "public"."remision_atajos" ADD CONSTRAINT "remision_atajos_cupsCodigo_fkey" FOREIGN KEY ("cupsCodigo") REFERENCES "public"."cups"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atencion_remisiones" ADD CONSTRAINT "atencion_remisiones_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atencion_remisiones" ADD CONSTRAINT "atencion_remisiones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atencion_remisiones" ADD CONSTRAINT "atencion_remisiones_cupsCodigo_fkey" FOREIGN KEY ("cupsCodigo") REFERENCES "public"."cups"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atencion_remisiones" ADD CONSTRAINT "atencion_remisiones_diagnosticoCodigo_fkey" FOREIGN KEY ("diagnosticoCodigo") REFERENCES "public"."cie10"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atencion_remisiones" ADD CONSTRAINT "atencion_remisiones_relacionado2Codigo_fkey" FOREIGN KEY ("relacionado2Codigo") REFERENCES "public"."cie10"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atencion_remisiones" ADD CONSTRAINT "atencion_remisiones_relacionado3Codigo_fkey" FOREIGN KEY ("relacionado3Codigo") REFERENCES "public"."cie10"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
