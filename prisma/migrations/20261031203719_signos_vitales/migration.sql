-- CreateTable
CREATE TABLE "public"."signos_vitales" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "presionSistolica" SMALLINT,
    "presionDiastolica" SMALLINT,
    "frecuenciaCardiaca" SMALLINT,
    "frecuenciaRespiratoria" SMALLINT,
    "temperatura" DECIMAL(4,1),
    "saturacion" SMALLINT,
    "pesoKg" DECIMAL(5,2),
    "tallaCm" DECIMAL(5,1),
    "perimetroCefalico" DECIMAL(5,1),
    "perimetroBraquial" DECIMAL(5,1),
    "perimetroToracico" DECIMAL(5,1),
    "perimetroAbdominal" DECIMAL(5,1),
    "perimetroMuslo" DECIMAL(5,1),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "signos_vitales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "signos_vitales_citaId_key" ON "public"."signos_vitales"("citaId");

-- CreateIndex
CREATE INDEX "signos_vitales_usuarioId_createdAt_idx" ON "public"."signos_vitales"("usuarioId", "createdAt");


-- AddForeignKey
ALTER TABLE "public"."signos_vitales" ADD CONSTRAINT "signos_vitales_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."signos_vitales" ADD CONSTRAINT "signos_vitales_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
