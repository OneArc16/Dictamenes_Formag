-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "cargo_docente_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."cargos_docentes" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20),
    "nombre" VARCHAR(150) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cargos_docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."especialidades_medicas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20),
    "nombre" VARCHAR(150) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "especialidades_medicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."empleado_especialidades" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "especialidadId" INTEGER NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "empleado_especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cargos_docentes_codigo_idx" ON "public"."cargos_docentes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_docentes_nombre_key" ON "public"."cargos_docentes"("nombre");

-- CreateIndex
CREATE INDEX "especialidades_medicas_codigo_idx" ON "public"."especialidades_medicas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_medicas_nombre_key" ON "public"."especialidades_medicas"("nombre");

-- CreateIndex
CREATE INDEX "empleado_especialidades_empleadoId_idx" ON "public"."empleado_especialidades"("empleadoId");

-- CreateIndex
CREATE INDEX "empleado_especialidades_especialidadId_idx" ON "public"."empleado_especialidades"("especialidadId");

-- CreateIndex
CREATE UNIQUE INDEX "empleado_especialidades_empleadoId_especialidadId_key" ON "public"."empleado_especialidades"("empleadoId", "especialidadId");

-- CreateIndex
CREATE INDEX "usuarios_cargo_docente_id_idx" ON "public"."usuarios"("cargo_docente_id");

-- AddForeignKey
ALTER TABLE "public"."empleado_especialidades" ADD CONSTRAINT "empleado_especialidades_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "public"."empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."empleado_especialidades" ADD CONSTRAINT "empleado_especialidades_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "public"."especialidades_medicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_cargo_docente_id_fkey" FOREIGN KEY ("cargo_docente_id") REFERENCES "public"."cargos_docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
