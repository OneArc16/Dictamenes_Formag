CREATE TYPE "FlujoDictamenVersion" AS ENUM ('LEGACY', 'ORIGEN_PREVIO');
CREATE TYPE "EstadoFormularioOrigen" AS ENUM ('BORRADOR', 'FINALIZADO', 'REABIERTO');
CREATE TYPE "EstadoSoporteOrigen" AS ENUM ('APORTADO', 'NO_APORTADO', 'NO_APLICA');
CREATE TYPE "JornadaEvento" AS ENUM ('NORMAL', 'EXTRA', 'NO_DETERMINADA');
CREATE TYPE "TipoSoporteOrigen" AS ENUM (
  'REPORTE_ACCIDENTE_TRABAJO',
  'DESCRIPCION_EVENTO',
  'EPICRISIS_RESUMEN_HISTORIA',
  'CERTIFICADO_DEFUNCION',
  'ANALISIS_PUESTO_TRABAJO',
  'EXAMENES_PREOCUPACIONALES',
  'INVESTIGACION_ACCIDENTE',
  'OTRO'
);
CREATE TYPE "TipoHistorialFormularioOrigen" AS ENUM ('CREACION', 'EDICION', 'FINALIZACION', 'REAPERTURA');
CREATE TYPE "ObjetivoReapertura" AS ENUM ('ORIGEN', 'PCL');
CREATE TYPE "AlcanceMotivoReapertura" AS ENUM ('ORIGEN', 'PCL', 'RECOMENDACION');

ALTER TABLE "dictamenes"
  ADD COLUMN "flujo_version" "FlujoDictamenVersion" NOT NULL DEFAULT 'LEGACY',
  ADD COLUMN "operacion_id" UUID,
  ADD COLUMN "pcl_iniciado_en" TIMESTAMP(3),
  ADD COLUMN "pcl_requiere_revision" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "origen_version_utilizada_pcl" INTEGER,
  ADD COLUMN "lock_version" INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX "dictamenes_operacion_id_key" ON "dictamenes"("operacion_id");
CREATE INDEX "dictamenes_flujo_version_idx" ON "dictamenes"("flujo_version");

CREATE TABLE "formularios_origen" (
  "id" SERIAL NOT NULL,
  "dictamen_id" INTEGER NOT NULL,
  "estado" "EstadoFormularioOrigen" NOT NULL DEFAULT 'BORRADOR',
  "formato_version" VARCHAR(50) NOT NULL DEFAULT 'BORRADOR-INSTITUCIONAL-1',
  "version_actual" INTEGER NOT NULL DEFAULT 1,
  "lock_version" INTEGER NOT NULL DEFAULT 1,
  "fecha_dictamen_origen" DATE NOT NULL,
  "numero_dictamen_origen" VARCHAR(40),
  "descripcion" TEXT,
  "fecha_ocurrencia" DATE,
  "hora_ocurrencia" TIME(0),
  "jornada_evento" "JornadaEvento",
  "tratamiento" TEXT,
  "concepto" TEXT,
  "fundamentos_derecho" TEXT,
  "tipo_evento" "DictamenTipoEvento",
  "origen_evento" "DictamenOrigenEvento",
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "finalizado_en" TIMESTAMP(3),
  "finalizado_por_id" INTEGER,
  "reabierto_en" TIMESTAMP(3),
  "reabierto_por_id" INTEGER,
  CONSTRAINT "formularios_origen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "formularios_origen_dictamen_id_key" ON "formularios_origen"("dictamen_id");
CREATE INDEX "formularios_origen_estado_updated_at_idx" ON "formularios_origen"("estado", "updated_at");
CREATE INDEX "formularios_origen_finalizado_por_id_idx" ON "formularios_origen"("finalizado_por_id");
CREATE INDEX "formularios_origen_reabierto_por_id_idx" ON "formularios_origen"("reabierto_por_id");

CREATE TABLE "historial_laboral_origen" (
  "id" SERIAL NOT NULL,
  "formulario_origen_id" INTEGER NOT NULL,
  "institucion_id" INTEGER,
  "institucion_nombre_snapshot" VARCHAR(200) NOT NULL,
  "cargo_id" INTEGER,
  "cargo_nombre_snapshot" VARCHAR(200) NOT NULL,
  "riesgos_laborales" TEXT NOT NULL,
  "jornada_laboral" VARCHAR(200) NOT NULL,
  "tiempo_exposicion_anios" DECIMAL(6,2) NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "historial_laboral_origen_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "historial_laboral_origen_formulario_origen_id_orden_idx"
  ON "historial_laboral_origen"("formulario_origen_id", "orden");
CREATE INDEX "historial_laboral_origen_institucion_id_idx" ON "historial_laboral_origen"("institucion_id");
CREATE INDEX "historial_laboral_origen_cargo_id_idx" ON "historial_laboral_origen"("cargo_id");

CREATE TABLE "soportes_fundamento_origen" (
  "id" SERIAL NOT NULL,
  "formulario_origen_id" INTEGER NOT NULL,
  "tipo" "TipoSoporteOrigen" NOT NULL,
  "estado" "EstadoSoporteOrigen" NOT NULL,
  "fecha_documento" DATE,
  "se_tuvo_en_cuenta" TEXT,
  "nombre_otro" VARCHAR(200),
  "orden" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "soportes_fundamento_origen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "soportes_fundamento_origen_formulario_origen_id_tipo_orden_key"
  ON "soportes_fundamento_origen"("formulario_origen_id", "tipo", "orden");
CREATE INDEX "soportes_fundamento_origen_formulario_origen_id_orden_idx"
  ON "soportes_fundamento_origen"("formulario_origen_id", "orden");

CREATE TABLE "diagnosticos_origen" (
  "id" SERIAL NOT NULL,
  "formulario_origen_id" INTEGER NOT NULL,
  "cie10_codigo" VARCHAR(10) NOT NULL,
  "tipo" "TipoDiagnostico" NOT NULL DEFAULT 'IMPRESION_DIAGNOSTICA',
  "es_principal" BOOLEAN NOT NULL DEFAULT false,
  "orden" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "diagnosticos_origen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "diagnosticos_origen_formulario_origen_id_cie10_codigo_key"
  ON "diagnosticos_origen"("formulario_origen_id", "cie10_codigo");
CREATE INDEX "diagnosticos_origen_formulario_origen_id_orden_idx"
  ON "diagnosticos_origen"("formulario_origen_id", "orden");
CREATE INDEX "diagnosticos_origen_cie10_codigo_idx" ON "diagnosticos_origen"("cie10_codigo");

CREATE TABLE "versiones_formulario_origen" (
  "id" SERIAL NOT NULL,
  "formulario_origen_id" INTEGER NOT NULL,
  "numero_version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "motivo" TEXT,
  "actor_id" INTEGER,
  "usuario_snapshot_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "versiones_formulario_origen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "versiones_formulario_origen_formulario_origen_id_numero_version_key"
  ON "versiones_formulario_origen"("formulario_origen_id", "numero_version");
CREATE INDEX "versiones_formulario_origen_actor_id_idx" ON "versiones_formulario_origen"("actor_id");

CREATE TABLE "historial_formulario_origen" (
  "id" SERIAL NOT NULL,
  "formulario_origen_id" INTEGER NOT NULL,
  "tipo" "TipoHistorialFormularioOrigen" NOT NULL,
  "estado_anterior" "EstadoFormularioOrigen",
  "estado_nuevo" "EstadoFormularioOrigen",
  "actor_id" INTEGER,
  "motivo_reapertura_id" INTEGER,
  "observacion" TEXT,
  "cambios" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "historial_formulario_origen_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "historial_formulario_origen_formulario_origen_id_created_at_idx"
  ON "historial_formulario_origen"("formulario_origen_id", "created_at");
CREATE INDEX "historial_formulario_origen_actor_id_idx" ON "historial_formulario_origen"("actor_id");
CREATE INDEX "historial_formulario_origen_motivo_reapertura_id_idx"
  ON "historial_formulario_origen"("motivo_reapertura_id");

ALTER TABLE "motivos_reapertura_recomendacion"
  ADD COLUMN "exige_observacion" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "motivos_reapertura_alcances" (
  "motivo_reapertura_id" INTEGER NOT NULL,
  "alcance" "AlcanceMotivoReapertura" NOT NULL,
  CONSTRAINT "motivos_reapertura_alcances_pkey" PRIMARY KEY ("motivo_reapertura_id", "alcance")
);

CREATE INDEX "motivos_reapertura_alcances_alcance_idx" ON "motivos_reapertura_alcances"("alcance");

ALTER TABLE "formularios_origen"
  ADD CONSTRAINT "formularios_origen_dictamen_id_fkey"
    FOREIGN KEY ("dictamen_id") REFERENCES "dictamenes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "formularios_origen_finalizado_por_id_fkey"
    FOREIGN KEY ("finalizado_por_id") REFERENCES "empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "formularios_origen_reabierto_por_id_fkey"
    FOREIGN KEY ("reabierto_por_id") REFERENCES "empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "historial_laboral_origen"
  ADD CONSTRAINT "historial_laboral_origen_formulario_origen_id_fkey"
    FOREIGN KEY ("formulario_origen_id") REFERENCES "formularios_origen"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "historial_laboral_origen_institucion_id_fkey"
    FOREIGN KEY ("institucion_id") REFERENCES "instituciones_educativas"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "historial_laboral_origen_cargo_id_fkey"
    FOREIGN KEY ("cargo_id") REFERENCES "cargos_docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "soportes_fundamento_origen"
  ADD CONSTRAINT "soportes_fundamento_origen_formulario_origen_id_fkey"
    FOREIGN KEY ("formulario_origen_id") REFERENCES "formularios_origen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "diagnosticos_origen"
  ADD CONSTRAINT "diagnosticos_origen_formulario_origen_id_fkey"
    FOREIGN KEY ("formulario_origen_id") REFERENCES "formularios_origen"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "diagnosticos_origen_cie10_codigo_fkey"
    FOREIGN KEY ("cie10_codigo") REFERENCES "cie10"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "versiones_formulario_origen"
  ADD CONSTRAINT "versiones_formulario_origen_formulario_origen_id_fkey"
    FOREIGN KEY ("formulario_origen_id") REFERENCES "formularios_origen"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "versiones_formulario_origen_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "versiones_formulario_origen_usuario_snapshot_id_fkey"
    FOREIGN KEY ("usuario_snapshot_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "historial_formulario_origen"
  ADD CONSTRAINT "historial_formulario_origen_formulario_origen_id_fkey"
    FOREIGN KEY ("formulario_origen_id") REFERENCES "formularios_origen"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "historial_formulario_origen_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "historial_formulario_origen_motivo_reapertura_id_fkey"
    FOREIGN KEY ("motivo_reapertura_id") REFERENCES "motivos_reapertura_recomendacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "motivos_reapertura_alcances"
  ADD CONSTRAINT "motivos_reapertura_alcances_motivo_reapertura_id_fkey"
    FOREIGN KEY ("motivo_reapertura_id") REFERENCES "motivos_reapertura_recomendacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "motivos_reapertura_alcances" ("motivo_reapertura_id", "alcance")
SELECT "id", 'PCL'::"AlcanceMotivoReapertura"
FROM "motivos_reapertura_recomendacion"
ON CONFLICT DO NOTHING;

INSERT INTO "motivos_reapertura_alcances" ("motivo_reapertura_id", "alcance")
SELECT "id", 'RECOMENDACION'::"AlcanceMotivoReapertura"
FROM "motivos_reapertura_recomendacion"
ON CONFLICT DO NOTHING;

INSERT INTO "permisos" (
  "codigo", "nombre", "descripcion", "modulo", "estado",
  "createdAt", "updatedAt", "createdBy", "updatedBy"
)
VALUES
  ('formulario_origen.read', 'Ver formularios de origen', NULL, 'formulario_origen', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migration', 'migration'),
  ('formulario_origen.edit', 'Editar formularios de origen', NULL, 'formulario_origen', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migration', 'migration'),
  ('formulario_origen.finalize', 'Finalizar formularios de origen', NULL, 'formulario_origen', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migration', 'migration'),
  ('formulario_origen.reopen', 'Reabrir formularios de origen', NULL, 'formulario_origen', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migration', 'migration')
ON CONFLICT ("codigo") DO UPDATE SET
  "nombre" = EXCLUDED."nombre",
  "modulo" = EXCLUDED."modulo",
  "estado" = 1,
  "updatedAt" = CURRENT_TIMESTAMP,
  "updatedBy" = 'migration';

INSERT INTO "perfil_permisos" (
  "perfilId", "permisoId", "permitido",
  "createdAt", "updatedAt", "createdBy", "updatedBy"
)
SELECT profile."id", permission."id", true,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migration', 'migration'
FROM "perfiles" profile
CROSS JOIN "permisos" permission
WHERE upper(profile."nombre") IN ('ADMIN', 'ADMINISTRADOR', 'MEDICO')
  AND permission."codigo" LIKE 'formulario_origen.%'
ON CONFLICT ("perfilId", "permisoId") DO UPDATE SET
  "permitido" = true,
  "updatedAt" = CURRENT_TIMESTAMP,
  "updatedBy" = 'migration';

INSERT INTO "perfil_permisos" (
  "perfilId", "permisoId", "permitido",
  "createdAt", "updatedAt", "createdBy", "updatedBy"
)
SELECT profile."id", permission."id", true,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migration', 'migration'
FROM "perfiles" profile
JOIN "permisos" permission
  ON permission."codigo" IN ('formulario_origen.read', 'formulario_origen.reopen')
WHERE upper(profile."nombre") IN ('ADMISIONISTA', 'ADMISIONES')
ON CONFLICT ("perfilId", "permisoId") DO UPDATE SET
  "permitido" = true,
  "updatedAt" = CURRENT_TIMESTAMP,
  "updatedBy" = 'migration';
