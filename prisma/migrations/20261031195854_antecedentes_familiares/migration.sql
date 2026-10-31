-- AlterTable
ALTER TABLE "public"."atenciones" ADD COLUMN     "antecedentesFamiliares" JSONB;

-- CreateTable
CREATE TABLE "public"."antecedentes_familiares" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "datos" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "citaId" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "antecedentes_familiares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "antecedentes_familiares_usuarioId_key" ON "public"."antecedentes_familiares"("usuarioId");


-- AddForeignKey
ALTER TABLE "public"."antecedentes_familiares" ADD CONSTRAINT "antecedentes_familiares_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
