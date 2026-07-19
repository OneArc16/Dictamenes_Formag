-- Agenda medica: horarios reutilizables, generaciones auditadas y cupos.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE "public"."EstadoGeneracionAgenda" AS ENUM (
  'PROCESANDO',
  'COMPLETADA',
  'COMPLETADA_CON_OMISIONES',
  'FALLIDA',
  'CANCELADA'
);

CREATE TYPE "public"."EstadoCupoMedico" AS ENUM (
  'DISPONIBLE',
  'RESERVADO',
  'ASIGNADO',
  'CANCELADO'
);

CREATE TABLE "public"."horarios_laborales" (
  "id" SERIAL NOT NULL,
  "sedeId" INTEGER NOT NULL,
  "medicoId" INTEGER,
  "nombre" VARCHAR(120) NOT NULL,
  "zonaHoraria" VARCHAR(80) NOT NULL DEFAULT 'America/Bogota',
  "vigenteDesde" DATE NOT NULL,
  "vigenteHasta" DATE,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" VARCHAR(100) NOT NULL,
  "updatedBy" VARCHAR(100) NOT NULL,
  CONSTRAINT "horarios_laborales_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "horarios_laborales_vigencia_check"
    CHECK ("vigenteHasta" IS NULL OR "vigenteHasta" >= "vigenteDesde")
);

CREATE TABLE "public"."horarios_laborales_bloques" (
  "id" SERIAL NOT NULL,
  "horarioLaboralId" INTEGER NOT NULL,
  "diaSemana" SMALLINT NOT NULL,
  "horaInicio" TIME(0) NOT NULL,
  "horaFin" TIME(0) NOT NULL,
  "orden" SMALLINT NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "horarios_laborales_bloques_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "horarios_laborales_bloques_dia_check" CHECK ("diaSemana" BETWEEN 1 AND 7),
  CONSTRAINT "horarios_laborales_bloques_horas_check" CHECK ("horaInicio" < "horaFin")
);

CREATE TABLE "public"."generaciones_agenda" (
  "id" SERIAL NOT NULL,
  "sedeId" INTEGER NOT NULL,
  "fechaInicial" DATE NOT NULL,
  "fechaFinal" DATE NOT NULL,
  "duracionMinutos" SMALLINT NOT NULL,
  "zonaHoraria" VARCHAR(80) NOT NULL DEFAULT 'America/Bogota',
  "estado" "public"."EstadoGeneracionAgenda" NOT NULL DEFAULT 'PROCESANDO',
  "idempotencyKey" UUID NOT NULL,
  "totalMedicos" INTEGER NOT NULL DEFAULT 0,
  "totalCandidatos" INTEGER NOT NULL DEFAULT 0,
  "totalCreados" INTEGER NOT NULL DEFAULT 0,
  "totalOmitidos" INTEGER NOT NULL DEFAULT 0,
  "totalConflictos" INTEGER NOT NULL DEFAULT 0,
  "errorResumen" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdBy" VARCHAR(100) NOT NULL,
  CONSTRAINT "generaciones_agenda_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "generaciones_agenda_fechas_check" CHECK ("fechaInicial" <= "fechaFinal"),
  CONSTRAINT "generaciones_agenda_duracion_check"
    CHECK ("duracionMinutos" BETWEEN 5 AND 240 AND "duracionMinutos" % 5 = 0)
);

CREATE TABLE "public"."generaciones_agenda_medicos" (
  "id" SERIAL NOT NULL,
  "generacionAgendaId" INTEGER NOT NULL,
  "medicoId" INTEGER NOT NULL,
  "horarioLaboralId" INTEGER NOT NULL,
  "totalCandidatos" INTEGER NOT NULL DEFAULT 0,
  "totalCreados" INTEGER NOT NULL DEFAULT 0,
  "totalOmitidos" INTEGER NOT NULL DEFAULT 0,
  "totalConflictos" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "generaciones_agenda_medicos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."generaciones_agenda_fechas_excluidas" (
  "id" SERIAL NOT NULL,
  "generacionAgendaId" INTEGER NOT NULL,
  "medicoId" INTEGER,
  "fecha" DATE NOT NULL,
  "motivo" VARCHAR(255),
  CONSTRAINT "generaciones_agenda_fechas_excluidas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."cupos_medicos" (
  "id" SERIAL NOT NULL,
  "generacionAgendaId" INTEGER NOT NULL,
  "medicoId" INTEGER NOT NULL,
  "sedeId" INTEGER NOT NULL,
  "inicio" TIMESTAMPTZ(3) NOT NULL,
  "fin" TIMESTAMPTZ(3) NOT NULL,
  "duracionMinutos" SMALLINT NOT NULL,
  "estado" "public"."EstadoCupoMedico" NOT NULL DEFAULT 'DISPONIBLE',
  "canceladoAt" TIMESTAMPTZ(3),
  "canceladoBy" VARCHAR(100),
  "motivoCancelacion" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" VARCHAR(100) NOT NULL,
  CONSTRAINT "cupos_medicos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cupos_medicos_intervalo_check" CHECK ("inicio" < "fin"),
  CONSTRAINT "cupos_medicos_duracion_check"
    CHECK ("duracionMinutos" BETWEEN 5 AND 240 AND "duracionMinutos" % 5 = 0),
  CONSTRAINT "cupos_medicos_cancelacion_check" CHECK (
    ("estado" = 'CANCELADO' AND "canceladoAt" IS NOT NULL AND "canceladoBy" IS NOT NULL)
    OR
    ("estado" <> 'CANCELADO' AND "canceladoAt" IS NULL AND "canceladoBy" IS NULL)
  )
);

CREATE UNIQUE INDEX "generaciones_agenda_idempotencyKey_key"
  ON "public"."generaciones_agenda"("idempotencyKey");
CREATE INDEX "generaciones_agenda_sedeId_createdAt_idx"
  ON "public"."generaciones_agenda"("sedeId", "createdAt");

CREATE UNIQUE INDEX "generaciones_agenda_medicos_generacionAgendaId_medicoId_key"
  ON "public"."generaciones_agenda_medicos"("generacionAgendaId", "medicoId");
CREATE INDEX "generaciones_agenda_medicos_medicoId_idx"
  ON "public"."generaciones_agenda_medicos"("medicoId");
CREATE INDEX "generaciones_agenda_medicos_horarioLaboralId_idx"
  ON "public"."generaciones_agenda_medicos"("horarioLaboralId");

CREATE INDEX "generaciones_agenda_fechas_excluidas_generacionAgendaId_idx"
  ON "public"."generaciones_agenda_fechas_excluidas"("generacionAgendaId");
CREATE INDEX "generaciones_agenda_fechas_excluidas_medicoId_fecha_idx"
  ON "public"."generaciones_agenda_fechas_excluidas"("medicoId", "fecha");
CREATE UNIQUE INDEX "agenda_exclusion_global_unique"
  ON "public"."generaciones_agenda_fechas_excluidas"("generacionAgendaId", "fecha")
  WHERE "medicoId" IS NULL;
CREATE UNIQUE INDEX "agenda_exclusion_medico_unique"
  ON "public"."generaciones_agenda_fechas_excluidas"("generacionAgendaId", "medicoId", "fecha")
  WHERE "medicoId" IS NOT NULL;

CREATE INDEX "horarios_laborales_sedeId_activo_vigencia_idx"
  ON "public"."horarios_laborales"("sedeId", "activo", "vigenteDesde", "vigenteHasta");
CREATE INDEX "horarios_laborales_medicoId_activo_vigencia_idx"
  ON "public"."horarios_laborales"("medicoId", "activo", "vigenteDesde", "vigenteHasta");
CREATE INDEX "horarios_laborales_bloques_horario_dia_orden_idx"
  ON "public"."horarios_laborales_bloques"("horarioLaboralId", "diaSemana", "orden");

CREATE INDEX "cupos_medicos_medicoId_inicio_idx"
  ON "public"."cupos_medicos"("medicoId", "inicio");
CREATE INDEX "cupos_medicos_sedeId_inicio_estado_idx"
  ON "public"."cupos_medicos"("sedeId", "inicio", "estado");
CREATE INDEX "cupos_medicos_generacionAgendaId_idx"
  ON "public"."cupos_medicos"("generacionAgendaId");
CREATE UNIQUE INDEX "cupos_medicos_medico_inicio_activo_unique"
  ON "public"."cupos_medicos"("medicoId", "inicio")
  WHERE "estado" <> 'CANCELADO';

-- Una sola vigencia activa por alcance y sin solapamientos.
ALTER TABLE "public"."horarios_laborales"
  ADD CONSTRAINT "horarios_laborales_sede_vigencia_excl"
  EXCLUDE USING gist (
    "sedeId" WITH =,
    daterange("vigenteDesde", COALESCE("vigenteHasta", 'infinity'::date), '[]') WITH &&
  ) WHERE ("activo" AND "medicoId" IS NULL);

ALTER TABLE "public"."horarios_laborales"
  ADD CONSTRAINT "horarios_laborales_medico_vigencia_excl"
  EXCLUDE USING gist (
    "medicoId" WITH =,
    daterange("vigenteDesde", COALESCE("vigenteHasta", 'infinity'::date), '[]') WITH &&
  ) WHERE ("activo" AND "medicoId" IS NOT NULL);

-- Los bloques de un mismo dia no pueden superponerse.
ALTER TABLE "public"."horarios_laborales_bloques"
  ADD CONSTRAINT "horarios_laborales_bloques_intervalo_excl"
  EXCLUDE USING gist (
    "horarioLaboralId" WITH =,
    "diaSemana" WITH =,
    tsrange(('2000-01-01'::date + "horaInicio")::timestamp,
            ('2000-01-01'::date + "horaFin")::timestamp, '[)') WITH &&
  );

-- Defensa final ante solicitudes concurrentes. Los intervalos adyacentes son validos.
ALTER TABLE "public"."cupos_medicos"
  ADD CONSTRAINT "cupos_medicos_intervalo_activo_excl"
  EXCLUDE USING gist (
    "medicoId" WITH =,
    tstzrange("inicio", "fin", '[)') WITH &&
  ) WHERE ("estado" <> 'CANCELADO');

ALTER TABLE "public"."horarios_laborales"
  ADD CONSTRAINT "horarios_laborales_sedeId_fkey"
  FOREIGN KEY ("sedeId") REFERENCES "public"."sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."horarios_laborales"
  ADD CONSTRAINT "horarios_laborales_medicoId_fkey"
  FOREIGN KEY ("medicoId") REFERENCES "public"."empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."horarios_laborales_bloques"
  ADD CONSTRAINT "horarios_laborales_bloques_horarioLaboralId_fkey"
  FOREIGN KEY ("horarioLaboralId") REFERENCES "public"."horarios_laborales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."generaciones_agenda"
  ADD CONSTRAINT "generaciones_agenda_sedeId_fkey"
  FOREIGN KEY ("sedeId") REFERENCES "public"."sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."generaciones_agenda_medicos"
  ADD CONSTRAINT "generaciones_agenda_medicos_generacionAgendaId_fkey"
  FOREIGN KEY ("generacionAgendaId") REFERENCES "public"."generaciones_agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."generaciones_agenda_medicos"
  ADD CONSTRAINT "generaciones_agenda_medicos_medicoId_fkey"
  FOREIGN KEY ("medicoId") REFERENCES "public"."empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."generaciones_agenda_medicos"
  ADD CONSTRAINT "generaciones_agenda_medicos_horarioLaboralId_fkey"
  FOREIGN KEY ("horarioLaboralId") REFERENCES "public"."horarios_laborales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."generaciones_agenda_fechas_excluidas"
  ADD CONSTRAINT "generaciones_agenda_fechas_excluidas_generacionAgendaId_fkey"
  FOREIGN KEY ("generacionAgendaId") REFERENCES "public"."generaciones_agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."generaciones_agenda_fechas_excluidas"
  ADD CONSTRAINT "generaciones_agenda_fechas_excluidas_medicoId_fkey"
  FOREIGN KEY ("medicoId") REFERENCES "public"."empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."cupos_medicos"
  ADD CONSTRAINT "cupos_medicos_generacionAgendaId_fkey"
  FOREIGN KEY ("generacionAgendaId") REFERENCES "public"."generaciones_agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."cupos_medicos"
  ADD CONSTRAINT "cupos_medicos_medicoId_fkey"
  FOREIGN KEY ("medicoId") REFERENCES "public"."empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."cupos_medicos"
  ADD CONSTRAINT "cupos_medicos_sedeId_fkey"
  FOREIGN KEY ("sedeId") REFERENCES "public"."sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
