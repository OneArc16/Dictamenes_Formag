-- CreateTable
CREATE TABLE "public"."atenciones" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER NOT NULL,
    "motivoConsulta" TEXT,
    "enfermedadActual" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "atenciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "atenciones_citaId_key" ON "public"."atenciones"("citaId");

-- AddForeignKey
ALTER TABLE "public"."atenciones" ADD CONSTRAINT "atenciones_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
