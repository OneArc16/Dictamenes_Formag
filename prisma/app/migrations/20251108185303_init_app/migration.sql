-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'ADMISIONISTA', 'MEDICO');

-- CreateTable
CREATE TABLE "public"."StaffOverride" (
    "id" TEXT NOT NULL,
    "empleadoCodigo" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "nombre" TEXT,
    "roleOverride" "public"."Role",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoginAudit" (
    "id" TEXT NOT NULL,
    "empleadoCodigo" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffOverride_empleadoCodigo_documento_key" ON "public"."StaffOverride"("empleadoCodigo", "documento");
