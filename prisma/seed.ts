import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncRbac } from './seed-rbac';

const prisma = new PrismaClient();
const AUDIT_USER = 'seed-production';

const ADMIN = {
  usuario: 'dcastano',
  primerNombre: 'DANIEL',
  segundoNombre: 'ANDRES',
  primerApellido: 'CASTAÑO',
  segundoApellido: 'NAVARRO',
} as const;

const REMISION_ATAJOS = [
  {
    cupsCodigo: '890362',
    etiqueta: 'Control medicina laboral',
    orden: 10,
  },
  {
    cupsCodigo: '890502',
    etiqueta: 'Junta médica',
    orden: 20,
  },
] as const;

const MODALIDADES_CITA = [
  { codigo: 'PRESENCIAL', nombre: 'Presencial' },
  { codigo: 'TELECONSULTA', nombre: 'Teleconsulta' },
] as const;

const MOTIVOS_CAMBIO_CITA = [
  { tipo: 'CANCELACION', codigo: 'SOLICITUD_PACIENTE', nombre: 'Solicitud del paciente' },
  { tipo: 'CANCELACION', codigo: 'ERROR_PROGRAMACION', nombre: 'Error de programación' },
  { tipo: 'REPROGRAMACION', codigo: 'SOLICITUD_PACIENTE', nombre: 'Solicitud del paciente' },
  { tipo: 'REPROGRAMACION', codigo: 'CAMBIO_DISPONIBILIDAD', nombre: 'Cambio de disponibilidad' },
] as const;

const HORARIO_SEDE_SANTA_MARTA = {
  sedeNombre: 'IPS SISM SANTA MARTA',
  nombre: 'Horario laboral IPS SISM Santa Marta',
  zonaHoraria: 'America/Bogota',
  bloques: [
    { diaSemana: 1, horaInicio: '07:00', horaFin: '12:00', orden: 1 },
    { diaSemana: 1, horaInicio: '13:00', horaFin: '16:30', orden: 2 },
    { diaSemana: 2, horaInicio: '07:00', horaFin: '12:00', orden: 1 },
    { diaSemana: 2, horaInicio: '13:00', horaFin: '16:30', orden: 2 },
    { diaSemana: 3, horaInicio: '07:00', horaFin: '12:00', orden: 1 },
    { diaSemana: 3, horaInicio: '13:00', horaFin: '16:30', orden: 2 },
    { diaSemana: 4, horaInicio: '07:00', horaFin: '12:00', orden: 1 },
    { diaSemana: 4, horaInicio: '13:00', horaFin: '16:30', orden: 2 },
    { diaSemana: 5, horaInicio: '07:00', horaFin: '12:00', orden: 1 },
    { diaSemana: 5, horaInicio: '13:00', horaFin: '16:00', orden: 2 },
  ],
} as const;

async function ensureProfiles() {
  const profiles = ['ADMINISTRADOR', 'ADMISIONISTA', 'MEDICO'] as const;

  for (const nombre of profiles) {
    await prisma.perfil.upsert({
      where: { nombre },
      update: { estado: 1, updatedBy: AUDIT_USER },
      create: {
        nombre,
        estado: 1,
        createdBy: AUDIT_USER,
        updatedBy: AUDIT_USER,
      },
    });
  }
}

async function ensureAppointmentModalities() {
  for (const modalidad of MODALIDADES_CITA) {
    await prisma.modalidadCita.upsert({
      where: { codigo: modalidad.codigo },
      update: { nombre: modalidad.nombre, estado: true },
      create: { ...modalidad, estado: true },
    });
  }
}

async function ensureAppointmentChangeReasons() {
  for (const motivo of MOTIVOS_CAMBIO_CITA) {
    await prisma.motivoCambioCita.upsert({
      where: { tipo_codigo: { tipo: motivo.tipo, codigo: motivo.codigo } },
      update: { nombre: motivo.nombre, estado: true },
      create: { ...motivo, estado: true },
    });
  }
}

async function ensureAdministrator() {
  const profile = await prisma.perfil.findUniqueOrThrow({
    where: { nombre: 'ADMINISTRADOR' },
    select: { id: true },
  });

  const existing = await prisma.empleado.findUnique({
    where: { usuario: ADMIN.usuario },
    select: { id: true },
  });

  if (existing) {
    await prisma.empleado.update({
      where: { id: existing.id },
      data: {
        ...ADMIN,
        perfilId: profile.id,
        activo: true,
      },
    });
    return;
  }

  const password = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (!password || password.length < 6) {
    throw new Error('SEED_ADMIN_PASSWORD debe tener al menos 6 caracteres para crear el administrador.');
  }

  await prisma.empleado.create({
    data: {
      ...ADMIN,
      contrasena: await bcrypt.hash(password, 10),
      perfilId: profile.id,
      activo: true,
    },
  });
}

async function ensureRemisionAtajos() {
  const existing = await prisma.cups.findMany({
    where: { codigo: { in: REMISION_ATAJOS.map((atajo) => atajo.cupsCodigo) } },
    select: { codigo: true },
  });
  const existingCodes = new Set(existing.map(({ codigo }) => codigo));
  const missingCodes = REMISION_ATAJOS
    .map(({ cupsCodigo }) => cupsCodigo)
    .filter((codigo) => !existingCodes.has(codigo));

  if (missingCodes.length > 0) {
    throw new Error(`Faltan los CUPS requeridos para los atajos: ${missingCodes.join(', ')}.`);
  }

  for (const atajo of REMISION_ATAJOS) {
    await prisma.remisionAtajo.upsert({
      where: { cupsCodigo: atajo.cupsCodigo },
      update: { ...atajo, activo: true },
      create: { ...atajo, activo: true },
    });
  }
}

function databaseTime(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

async function ensureSantaMartaWorkSchedule() {
  const sede = await prisma.sede.findFirst({
    where: {
      nombre: { equals: HORARIO_SEDE_SANTA_MARTA.sedeNombre, mode: 'insensitive' },
      estado: 1,
    },
    select: { id: true },
  });
  if (!sede) {
    throw new Error(`No existe una sede activa llamada ${HORARIO_SEDE_SANTA_MARTA.sedeNombre}.`);
  }

  const schedules = await prisma.horarioLaboral.findMany({
    where: { sedeId: sede.id, medicoId: null },
    select: { id: true, nombre: true, activo: true },
  });
  const schedule = schedules.find(({ nombre }) => nombre === HORARIO_SEDE_SANTA_MARTA.nombre);
  const otherActiveSchedule = schedules.find(
    ({ id, activo }) => activo && id !== schedule?.id,
  );

  if (otherActiveSchedule) {
    throw new Error(
      `La sede ya tiene un horario compartido activo: ${otherActiveSchedule.nombre}.`,
    );
  }

  const blocks = HORARIO_SEDE_SANTA_MARTA.bloques.map((block) => ({
    ...block,
    horaInicio: databaseTime(block.horaInicio),
    horaFin: databaseTime(block.horaFin),
  }));

  if (!schedule) {
    await prisma.horarioLaboral.create({
      data: {
        sedeId: sede.id,
        medicoId: null,
        nombre: HORARIO_SEDE_SANTA_MARTA.nombre,
        zonaHoraria: HORARIO_SEDE_SANTA_MARTA.zonaHoraria,
        activo: true,
        createdBy: AUDIT_USER,
        updatedBy: AUDIT_USER,
        bloques: { create: blocks },
      },
    });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.horarioLaboralBloque.deleteMany({ where: { horarioLaboralId: schedule.id } });
    await tx.horarioLaboral.update({
      where: { id: schedule.id },
      data: {
        zonaHoraria: HORARIO_SEDE_SANTA_MARTA.zonaHoraria,
        activo: true,
        updatedBy: AUDIT_USER,
        bloques: { create: blocks },
      },
    });
  });
}

export async function runProductionSeed() {
  await ensureProfiles();
  await syncRbac(prisma);
  await ensureAdministrator();
  await ensureAppointmentModalities();
  await ensureAppointmentChangeReasons();
  await ensureRemisionAtajos();
  await ensureSantaMartaWorkSchedule();

  console.log('Seed de producción ejecutado correctamente.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runProductionSeed()
    .catch((error) => {
      console.error('Error ejecutando seed de producción:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
