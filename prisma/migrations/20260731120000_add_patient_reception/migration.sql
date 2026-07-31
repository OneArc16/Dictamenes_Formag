-- Reception is intentionally modelled separately from Agenda: a slot is an
-- availability record, while an appointment is the patient-facing lifecycle.
CREATE TYPE "MedioSolicitudCita" AS ENUM ('PRESENCIAL', 'TELEFONO', 'CORREO', 'WHATSAPP');
CREATE TYPE "EstadoCita" AS ENUM ('ASIGNADA', 'ATENDIDA', 'REPROGRAMADA', 'CANCELADA');
CREATE TYPE "TipoEventoCita" AS ENUM ('CREADA', 'ACTIVADA', 'CANCELADA', 'REPROGRAMADA');
CREATE TYPE "ResultadoAuditoriaRecepcion" AS ENUM ('SUCCESS', 'DENIED', 'CONFLICT', 'FAILURE');
CREATE TYPE "EstadoOperacionIdempotente" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "TipoMotivoCambioCita" AS ENUM ('CANCELACION', 'REPROGRAMACION');
CREATE TYPE "TipoDocumentoCita" AS ENUM ('RECORDATORIO_CITA');

ALTER TABLE "usuarios" ADD COLUMN "contactVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "modalidades_cita" (
  "id" SERIAL NOT NULL,
  "codigo" VARCHAR(40) NOT NULL,
  "nombre" VARCHAR(100) NOT NULL,
  "estado" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "modalidades_cita_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "modalidades_cita_codigo_key" ON "modalidades_cita"("codigo");

CREATE TABLE "citas" (
  "id" SERIAL NOT NULL,
  "usuarioId" INTEGER NOT NULL,
  "cupoMedicoId" INTEGER NOT NULL,
  "sedeId" INTEGER NOT NULL,
  "medicoId" INTEGER NOT NULL,
  "especialidadId" INTEGER NOT NULL,
  "modalidadId" INTEGER NOT NULL,
  "inicioProgramado" TIMESTAMPTZ(3) NOT NULL,
  "finProgramado" TIMESTAMPTZ(3) NOT NULL,
  "sedeNombre" VARCHAR(100) NOT NULL,
  "medicoNombre" VARCHAR(180) NOT NULL,
  "especialidadNombre" VARCHAR(150) NOT NULL,
  "modalidadNombre" VARCHAR(100) NOT NULL,
  "medioSolicitud" "MedioSolicitudCita" NOT NULL,
  "estado" "EstadoCita" NOT NULL DEFAULT 'ASIGNADA',
  "activadaAt" TIMESTAMPTZ(3),
  "activadaBy" INTEGER,
  "citaOrigenId" INTEGER,
  "lockVersion" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" INTEGER NOT NULL,
  CONSTRAINT "citas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "citas_intervalo_valido" CHECK ("finProgramado" > "inicioProgramado")
);

CREATE TABLE "citas_historial" (
  "id" SERIAL NOT NULL,
  "citaId" INTEGER NOT NULL,
  "usuarioId" INTEGER NOT NULL,
  "cupoMedicoId" INTEGER NOT NULL,
  "tipoEvento" "TipoEventoCita" NOT NULL,
  "estadoAnterior" "EstadoCita",
  "estadoNuevo" "EstadoCita",
  "estadoCupoAnterior" "EstadoCupoMedico",
  "estadoCupoNuevo" "EstadoCupoMedico",
  "actorEmpleadoId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "citas_historial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auditoria_recepcion" (
  "id" SERIAL NOT NULL,
  "requestId" VARCHAR(100) NOT NULL,
  "actorEmpleadoId" INTEGER NOT NULL,
  "sedeId" INTEGER,
  "action" VARCHAR(80) NOT NULL,
  "result" "ResultadoAuditoriaRecepcion" NOT NULL,
  "resourceType" VARCHAR(50) NOT NULL,
  "resourceId" VARCHAR(100),
  "reasonCode" VARCHAR(80),
  "httpStatus" INTEGER,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "auditoria_recepcion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operaciones_idempotentes" (
  "id" UUID NOT NULL,
  "actorEmpleadoId" INTEGER NOT NULL,
  "operationType" VARCHAR(80) NOT NULL,
  "idempotencyKey" UUID NOT NULL,
  "payloadHash" CHAR(64) NOT NULL,
  "status" "EstadoOperacionIdempotente" NOT NULL DEFAULT 'PROCESSING',
  "resultResourceId" VARCHAR(100),
  "resultVersion" INTEGER,
  "responseStatus" INTEGER,
  "responseCode" VARCHAR(80),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "operaciones_idempotentes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reception_site_policies" (
  "id" SERIAL NOT NULL,
  "sedeId" INTEGER NOT NULL,
  "version" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "cancelCutoffMinutes" INTEGER NOT NULL DEFAULT 0,
  "rescheduleCutoffMinutes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reception_site_policies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reception_site_policies_cutoff_range" CHECK ("cancelCutoffMinutes" BETWEEN 0 AND 43200 AND "rescheduleCutoffMinutes" BETWEEN 0 AND 43200)
);

CREATE TABLE "motivos_cambio_cita" (
  "id" SERIAL NOT NULL,
  "tipo" "TipoMotivoCambioCita" NOT NULL,
  "codigo" VARCHAR(50) NOT NULL,
  "nombre" VARCHAR(160) NOT NULL,
  "estado" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "motivos_cambio_cita_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documentos_cita" (
  "id" UUID NOT NULL,
  "citaId" INTEGER NOT NULL,
  "tipo" "TipoDocumentoCita" NOT NULL,
  "snapshotCiphertext" BYTEA NOT NULL,
  "nonce" BYTEA NOT NULL,
  "authTag" BYTEA NOT NULL,
  "checksumSha256" CHAR(64) NOT NULL,
  "keyVersion" VARCHAR(40) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" INTEGER NOT NULL,
  CONSTRAINT "documentos_cita_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reception_search_rate_limits" (
  "id" SERIAL NOT NULL,
  "scopeType" VARCHAR(30) NOT NULL,
  "scopeId" VARCHAR(80) NOT NULL,
  "windowType" VARCHAR(30) NOT NULL,
  "windowStart" TIMESTAMPTZ(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reception_search_rate_limits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "citas_usuarioId_inicioProgramado_idx" ON "citas"("usuarioId", "inicioProgramado" DESC);
CREATE INDEX "citas_usuarioId_estado_inicioProgramado_idx" ON "citas"("usuarioId", "estado", "inicioProgramado" DESC);
CREATE INDEX "citas_cupoMedicoId_idx" ON "citas"("cupoMedicoId");
CREATE INDEX "citas_citaOrigenId_idx" ON "citas"("citaOrigenId");
CREATE INDEX "citas_historial_usuarioId_createdAt_idx" ON "citas_historial"("usuarioId", "createdAt" DESC);
CREATE INDEX "citas_historial_citaId_createdAt_idx" ON "citas_historial"("citaId", "createdAt" DESC);
CREATE INDEX "auditoria_recepcion_actor_createdAt_idx" ON "auditoria_recepcion"("actorEmpleadoId", "occurredAt" DESC);
CREATE INDEX "auditoria_recepcion_resource_occurredAt_idx" ON "auditoria_recepcion"("resourceType", "resourceId", "occurredAt" DESC);
CREATE INDEX "auditoria_recepcion_action_result_occurredAt_idx" ON "auditoria_recepcion"("action", "result", "occurredAt" DESC);
CREATE INDEX "auditoria_recepcion_requestId_idx" ON "auditoria_recepcion"("requestId");
CREATE UNIQUE INDEX "operaciones_idempotentes_actor_type_key" ON "operaciones_idempotentes"("actorEmpleadoId", "operationType", "idempotencyKey");
CREATE INDEX "operaciones_idempotentes_status_updatedAt_idx" ON "operaciones_idempotentes"("status", "updatedAt");
CREATE UNIQUE INDEX "reception_site_policies_site_version_key" ON "reception_site_policies"("sedeId", "version");
CREATE UNIQUE INDEX "reception_site_policies_one_active_per_site" ON "reception_site_policies"("sedeId") WHERE "active";
CREATE INDEX "reception_site_policies_site_active_idx" ON "reception_site_policies"("sedeId", "active");
CREATE UNIQUE INDEX "motivos_cambio_cita_tipo_codigo_key" ON "motivos_cambio_cita"("tipo", "codigo");
CREATE INDEX "motivos_cambio_cita_tipo_estado_idx" ON "motivos_cambio_cita"("tipo", "estado");
CREATE INDEX "documentos_cita_cita_tipo_idx" ON "documentos_cita"("citaId", "tipo");
CREATE UNIQUE INDEX "reception_search_rate_limits_window_key" ON "reception_search_rate_limits"("scopeType", "scopeId", "windowType", "windowStart");
CREATE INDEX "reception_search_rate_limits_windowStart_idx" ON "reception_search_rate_limits"("windowStart");
CREATE UNIQUE INDEX "citas_cupo_vigente_unique" ON "citas"("cupoMedicoId") WHERE "estado" IN ('ASIGNADA', 'ATENDIDA');
CREATE INDEX "cupos_medicos_reception_available_idx" ON "cupos_medicos"("sedeId", "inicio", "medicoId") WHERE "estado" = 'DISPONIBLE';
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_intervalo_asignado_excl"
  EXCLUDE USING gist ("usuarioId" WITH =, tstzrange("inicioProgramado", "finProgramado", '[)') WITH &&)
  WHERE ("estado" = 'ASIGNADA');

ALTER TABLE "citas" ADD CONSTRAINT "citas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas" ADD CONSTRAINT "citas_cupoMedicoId_fkey" FOREIGN KEY ("cupoMedicoId") REFERENCES "cupos_medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas" ADD CONSTRAINT "citas_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas" ADD CONSTRAINT "citas_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas" ADD CONSTRAINT "citas_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "especialidades_medicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas" ADD CONSTRAINT "citas_modalidadId_fkey" FOREIGN KEY ("modalidadId") REFERENCES "modalidades_cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas" ADD CONSTRAINT "citas_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas" ADD CONSTRAINT "citas_citaOrigenId_fkey" FOREIGN KEY ("citaOrigenId") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citas_historial" ADD CONSTRAINT "citas_historial_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reception_site_policies" ADD CONSTRAINT "reception_site_policies_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "documentos_cita" ADD CONSTRAINT "documentos_cita_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- This catches writers outside Reception as well, so optimistic contact edits
-- cannot silently overwrite a telephone, email or address updated elsewhere.
CREATE OR REPLACE FUNCTION increment_usuario_contact_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."celular" IS DISTINCT FROM OLD."celular"
    OR NEW."telefono" IS DISTINCT FROM OLD."telefono"
    OR NEW."email" IS DISTINCT FROM OLD."email"
    OR NEW."direccion" IS DISTINCT FROM OLD."direccion" THEN
    NEW."contactVersion" := OLD."contactVersion" + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_contact_version_trigger
BEFORE UPDATE ON "usuarios"
FOR EACH ROW EXECUTE FUNCTION increment_usuario_contact_version();

-- Historial y auditoría son hechos append-only; las correcciones se expresan
-- como otro evento, nunca sobrescribiendo o borrando el original.
CREATE OR REPLACE FUNCTION reject_reception_append_only_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Los registros de recepción son append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER citas_historial_append_only_trigger
BEFORE UPDATE OR DELETE ON "citas_historial"
FOR EACH ROW EXECUTE FUNCTION reject_reception_append_only_mutation();

CREATE TRIGGER auditoria_recepcion_append_only_trigger
BEFORE UPDATE OR DELETE ON "auditoria_recepcion"
FOR EACH ROW EXECUTE FUNCTION reject_reception_append_only_mutation();

INSERT INTO "modalidades_cita" ("codigo", "nombre", "estado", "updatedAt")
VALUES ('PRESENCIAL', 'Presencial', true, CURRENT_TIMESTAMP),
       ('TELECONSULTA', 'Teleconsulta', true, CURRENT_TIMESTAMP)
ON CONFLICT ("codigo") DO NOTHING;

INSERT INTO "reception_site_policies" ("sedeId", "version", "active", "cancelCutoffMinutes", "rescheduleCutoffMinutes", "activatedAt")
SELECT "id", 1, true, 0, 0, CURRENT_TIMESTAMP FROM "sedes" WHERE "estado" = 1
ON CONFLICT ("sedeId", "version") DO NOTHING;

INSERT INTO "motivos_cambio_cita" ("tipo", "codigo", "nombre", "estado", "updatedAt")
VALUES ('CANCELACION', 'SOLICITUD_PACIENTE', 'Solicitud del paciente', true, CURRENT_TIMESTAMP),
       ('CANCELACION', 'ERROR_PROGRAMACION', 'Error de programación', true, CURRENT_TIMESTAMP),
       ('REPROGRAMACION', 'SOLICITUD_PACIENTE', 'Solicitud del paciente', true, CURRENT_TIMESTAMP),
       ('REPROGRAMACION', 'CAMBIO_DISPONIBILIDAD', 'Cambio de disponibilidad', true, CURRENT_TIMESTAMP)
ON CONFLICT ("tipo", "codigo") DO NOTHING;
