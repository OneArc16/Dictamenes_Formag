ALTER TABLE "public"."empleados" ADD COLUMN "usuario" VARCHAR(50);

WITH nombres_base AS (
  SELECT
    "id",
    COALESCE(
      NULLIF(
        LOWER(
          REGEXP_REPLACE(
            SPLIT_PART(COALESCE("email", ''), '@', 1),
            '[^a-zA-Z0-9._-]',
            '',
            'g'
          )
        ),
        ''
      ),
      'empleado'
    ) AS "base"
  FROM "public"."empleados"
),
nombres_finales AS (
  SELECT
    "id",
    CASE
      WHEN COUNT(*) OVER (PARTITION BY "base") = 1 THEN LEFT("base", 50)
      ELSE LEFT("base", 40) || '_' || "id"
    END AS "usuario"
  FROM nombres_base
)
UPDATE "public"."empleados" AS e
SET "usuario" = n."usuario"
FROM nombres_finales AS n
WHERE e."id" = n."id" AND e."usuario" IS NULL;

ALTER TABLE "public"."empleados" ALTER COLUMN "usuario" SET NOT NULL;

CREATE UNIQUE INDEX "empleados_usuario_key" ON "public"."empleados"("usuario");
