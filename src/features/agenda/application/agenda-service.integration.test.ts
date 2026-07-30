import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { calculateAgenda, confirmAgendaGeneration } from './agenda-service';
import { createWorkSchedule } from './schedule-service';
import { prisma } from '@/lib/prisma';

const enabled = process.env.AGENDA_INTEGRATION_TEST === '1';

before(async () => {
  if (!enabled) return;
  const database = await prisma.$queryRaw<Array<{ name: string }>>`SELECT current_database() AS name`;
  if (!database[0]?.name.includes('agenda_test')) {
    throw new Error('La prueba de integración solo puede ejecutarse en una base agenda_test.');
  }
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "centro_medico" RESTART IDENTITY CASCADE',
  );
  const center = await prisma.centroMedico.create({
    data: {
      codigoHabilitacion: 'AGENDA-TEST',
      nombre: 'Centro agenda test',
      updatedAt: new Date(),
    },
  });
  const site = await prisma.sede.create({
    data: { centroMedicoId: center.id, nombre: 'Sede agenda test', updatedAt: new Date() },
  });
  const profile = await prisma.perfil.upsert({
    where: { nombre: 'MEDICO' },
    update: { estado: 1 },
    create: { nombre: 'MEDICO', updatedAt: new Date() },
  });
  await prisma.empleado.create({
    data: {
      primerNombre: 'Ada',
      primerApellido: 'Médica',
      usuario: 'agenda-integration-doctor',
      perfilId: profile.id,
      idSede: site.id,
    },
  });
  await createWorkSchedule(
    {
      sedeId: site.id,
      nombre: 'Jornada partida',
      zonaHoraria: 'America/Bogota',
      bloques: [
        { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00' },
        { diaSemana: 1, horaInicio: '13:00', horaFin: '17:00' },
      ],
    },
    'integration-test',
  );
});

after(async () => {
  await prisma.$disconnect();
});

test('preview, confirmación idempotente y restricción de superposición', { skip: !enabled }, async () => {
  const site = await prisma.sede.findFirstOrThrow({ where: { nombre: 'Sede agenda test' } });
  const doctor = await prisma.empleado.findFirstOrThrow({ where: { usuario: 'agenda-integration-doctor' } });
  const input = {
    sedeId: site.id,
    medicoIds: [doctor.id],
    fechaInicial: '2030-02-04',
    fechaFinal: '2030-02-04',
    duracionMinutos: 30,
    duracionesPorMedico: [],
    fechasExcluidas: [],
    fechasHabilitadas: [],
    exclusionesPorMedico: [],
    horariosPersonalizados: [],
  };

  const closedHoliday = await calculateAgenda({
    ...input,
    fechaInicial: '2030-01-07',
    fechaFinal: '2030-01-07',
  });
  assert.equal(closedHoliday.preview.totalNuevos, 0);

  const enabledHoliday = await calculateAgenda({
    ...input,
    fechaInicial: '2030-01-07',
    fechaFinal: '2030-01-07',
    fechasHabilitadas: ['2030-01-07'],
  });
  assert.equal(enabledHoliday.preview.totalNuevos, 16);

  const preview = await calculateAgenda(input);
  assert.equal(preview.preview.totalNuevos, 16);
  assert.equal(preview.preview.bloqueado, false);

  const idempotencyKey = crypto.randomUUID();
  const first = await confirmAgendaGeneration(
    { ...input, idempotencyKey, previewFingerprint: preview.preview.fingerprint },
    'integration-test',
  );
  const repeated = await confirmAgendaGeneration({ ...input, idempotencyKey }, 'integration-test');
  assert.equal(first.generacionId, repeated.generacionId);
  assert.equal(await prisma.cupoMedico.count(), 16);

  const firstSlot = await prisma.cupoMedico.findFirstOrThrow({ orderBy: { inicio: 'asc' } });
  await assert.rejects(
    prisma.cupoMedico.create({
      data: {
        generacionAgendaId: first.generacionId,
        medicoId: doctor.id,
        sedeId: site.id,
        inicio: new Date(firstSlot.inicio.getTime() + 15 * 60_000),
        fin: new Date(firstSlot.fin.getTime() + 15 * 60_000),
        duracionMinutos: 30,
        createdBy: 'integration-test',
      },
    }),
  );

  await prisma.cupoMedico.updateMany({
    data: {
      estado: 'CANCELADO',
      canceladoAt: new Date(),
      canceladoBy: 'integration-test',
    },
  });
  const afterCancellation = await calculateAgenda(input);
  assert.equal(afterCancellation.preview.totalNuevos, 16);
  await confirmAgendaGeneration(
    { ...input, idempotencyKey: crypto.randomUUID(), previewFingerprint: afterCancellation.preview.fingerprint },
    'integration-test',
  );
  assert.equal(await prisma.cupoMedico.count({ where: { estado: 'DISPONIBLE' } }), 16);

  await createWorkSchedule(
    {
      sedeId: site.id,
      medicoId: doctor.id,
      nombre: 'Horario particular corto',
      zonaHoraria: 'America/Bogota',
      bloques: [{ diaSemana: 1, horaInicio: '09:00', horaFin: '11:00' }],
    },
    'integration-test',
  );
  const particular = await calculateAgenda({
    ...input,
    fechaInicial: '2030-01-14',
    fechaFinal: '2030-01-14',
  });
  assert.equal(particular.preview.totalNuevos, 4);
  assert.equal(particular.preview.medicos[0].horarioOrigen, 'PARTICULAR');

  const customized = await calculateAgenda({
    ...input,
    fechaInicial: '2030-01-14',
    fechaFinal: '2030-01-21',
    horariosPersonalizados: [
      {
        medicoId: doctor.id,
        fechas: [
          {
            fecha: '2030-01-14',
            bloques: [{ horaInicio: '10:00', horaFin: '11:00' }],
          },
        ],
      },
    ],
  });
  assert.equal(customized.preview.totalNuevos, 6);
  assert.equal(customized.preview.medicos[0].horarioOrigen, 'PERSONALIZADO');

  const unchanged = await calculateAgenda({
    ...input,
    fechaInicial: '2030-01-14',
    fechaFinal: '2030-01-14',
  });
  assert.equal(unchanged.preview.totalNuevos, 4);
  assert.equal(unchanged.preview.medicos[0].horarioOrigen, 'PARTICULAR');

  const customDuration = await calculateAgenda({
    ...input,
    fechaInicial: '2030-01-28',
    fechaFinal: '2030-01-28',
    duracionesPorMedico: [
      { medicoId: doctor.id, duracionMinutos: 60 },
    ],
  });
  assert.equal(customDuration.preview.totalNuevos, 2);
  assert.equal(customDuration.preview.medicos[0].duracionMinutos, 60);
});
