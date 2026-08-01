ALTER TABLE "operaciones_idempotentes" RENAME COLUMN "payloadHash" TO "payloadMac";
ALTER TABLE "operaciones_idempotentes"
  ADD COLUMN "ownerToken" UUID,
  ADD COLUMN "leaseUntil" TIMESTAMP(3),
  ADD COLUMN "lockVersion" INTEGER NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS "operaciones_idempotentes_status_updatedAt_idx";
CREATE INDEX "operaciones_idempotentes_status_leaseUntil_idx"
  ON "operaciones_idempotentes"("status", "leaseUntil");
