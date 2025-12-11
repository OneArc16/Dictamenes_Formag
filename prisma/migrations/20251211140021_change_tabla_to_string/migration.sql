-- AlterTable
ALTER TABLE "public"."deficiencias" ALTER COLUMN "tabla" DROP DEFAULT,
ALTER COLUMN "tabla" SET DATA TYPE VARCHAR(10);
