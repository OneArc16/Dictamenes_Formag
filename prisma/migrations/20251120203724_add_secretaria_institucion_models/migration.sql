/*
  Warnings:

  - You are about to drop the column `institucionEducativa` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `secretaria` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tipoDocumento,numeroIdentidad]` on the table `empleados` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `empleados` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."barrios" ADD COLUMN     "codigoPostal" VARCHAR(10),
ADD COLUMN     "comuna" VARCHAR(50),
ADD COLUMN     "localidad" VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."dictamenes" ADD COLUMN     "empleadoId" INTEGER,
ADD COLUMN     "reabierto" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."usuarios" DROP COLUMN "institucionEducativa",
DROP COLUMN "secretaria",
ADD COLUMN     "institucionEducativaId" INTEGER,
ADD COLUMN     "secretariaId" INTEGER;

-- CreateTable
CREATE TABLE "public"."secretarias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "codigo" VARCHAR(10),

    CONSTRAINT "secretarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instituciones_educativas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "codigoDane" VARCHAR(15),
    "secretariaId" INTEGER,

    CONSTRAINT "instituciones_educativas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "secretarias_codigo_key" ON "public"."secretarias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "instituciones_educativas_codigoDane_key" ON "public"."instituciones_educativas"("codigoDane");

-- CreateIndex
CREATE INDEX "dictamenes_empleadoId_idx" ON "public"."dictamenes"("empleadoId");

-- CreateIndex
CREATE INDEX "dictamenes_estado_reabierto_fechaDictamen_idx" ON "public"."dictamenes"("estado", "reabierto", "fechaDictamen");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_tipoDocumento_numeroIdentidad_key" ON "public"."empleados"("tipoDocumento", "numeroIdentidad");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_email_key" ON "public"."empleados"("email");

-- AddForeignKey
ALTER TABLE "public"."instituciones_educativas" ADD CONSTRAINT "instituciones_educativas_secretariaId_fkey" FOREIGN KEY ("secretariaId") REFERENCES "public"."secretarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_secretariaId_fkey" FOREIGN KEY ("secretariaId") REFERENCES "public"."secretarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_institucionEducativaId_fkey" FOREIGN KEY ("institucionEducativaId") REFERENCES "public"."instituciones_educativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamenes" ADD CONSTRAINT "dictamenes_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "public"."empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;
