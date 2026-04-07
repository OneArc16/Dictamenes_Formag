-- CreateTable
CREATE TABLE "public"."permisos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "modulo" VARCHAR(50),
    "estado" SMALLINT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."perfil_permisos" (
    "id" SERIAL NOT NULL,
    "perfilId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,
    "permitido" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),

    CONSTRAINT "perfil_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "public"."permisos"("codigo");

-- CreateIndex
CREATE INDEX "permisos_modulo_idx" ON "public"."permisos"("modulo");

-- CreateIndex
CREATE INDEX "permisos_estado_idx" ON "public"."permisos"("estado");

-- CreateIndex
CREATE INDEX "perfil_permisos_perfilId_idx" ON "public"."perfil_permisos"("perfilId");

-- CreateIndex
CREATE INDEX "perfil_permisos_permisoId_idx" ON "public"."perfil_permisos"("permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_permisos_perfilId_permisoId_key" ON "public"."perfil_permisos"("perfilId", "permisoId");

-- AddForeignKey
ALTER TABLE "public"."perfil_permisos" ADD CONSTRAINT "perfil_permisos_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."perfil_permisos" ADD CONSTRAINT "perfil_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "public"."permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
