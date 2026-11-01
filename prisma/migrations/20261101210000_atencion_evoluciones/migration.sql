-- Notas de evolución que el médico escribe durante la atención del docente.
CREATE TABLE "public"."atencion_evoluciones" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "atencion_evoluciones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "atencion_evoluciones_citaId_createdAt_idx" ON "public"."atencion_evoluciones"("citaId", "createdAt");
CREATE INDEX "atencion_evoluciones_usuarioId_createdAt_idx" ON "public"."atencion_evoluciones"("usuarioId", "createdAt");

ALTER TABLE "public"."atencion_evoluciones" ADD CONSTRAINT "atencion_evoluciones_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."atencion_evoluciones" ADD CONSTRAINT "atencion_evoluciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
