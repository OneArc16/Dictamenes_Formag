-- AlterTable
ALTER TABLE "public"."dictamenes" ADD COLUMN     "sedeId" INTEGER;

-- CreateTable
CREATE TABLE "public"."sede_notificadores" (
    "id" SERIAL NOT NULL,
    "sedeId" INTEGER NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "vigente_desde" DATE,
    "vigente_hasta" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),

    CONSTRAINT "sede_notificadores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sede_notificadores_sedeId_idx" ON "public"."sede_notificadores"("sedeId");

-- CreateIndex
CREATE INDEX "sede_notificadores_empleadoId_idx" ON "public"."sede_notificadores"("empleadoId");

-- CreateIndex
CREATE INDEX "sede_notificadores_estado_idx" ON "public"."sede_notificadores"("estado");

-- CreateIndex
CREATE INDEX "sede_notificadores_vigente_desde_vigente_hasta_idx" ON "public"."sede_notificadores"("vigente_desde", "vigente_hasta");

-- CreateIndex
CREATE UNIQUE INDEX "sede_notificadores_sedeId_empleadoId_key" ON "public"."sede_notificadores"("sedeId", "empleadoId");

-- CreateIndex
CREATE INDEX "dictamenes_sedeId_idx" ON "public"."dictamenes"("sedeId");

-- CreateIndex
CREATE INDEX "empleados_idSede_idx" ON "public"."empleados"("idSede");

-- CreateIndex
CREATE INDEX "usuarios_idSede_idx" ON "public"."usuarios"("idSede");

-- AddForeignKey
ALTER TABLE "public"."sede_notificadores" ADD CONSTRAINT "sede_notificadores_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "public"."sedes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sede_notificadores" ADD CONSTRAINT "sede_notificadores_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "public"."empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_idSede_fkey" FOREIGN KEY ("idSede") REFERENCES "public"."sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."empleados" ADD CONSTRAINT "empleados_idSede_fkey" FOREIGN KEY ("idSede") REFERENCES "public"."sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamenes" ADD CONSTRAINT "dictamenes_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "public"."sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
