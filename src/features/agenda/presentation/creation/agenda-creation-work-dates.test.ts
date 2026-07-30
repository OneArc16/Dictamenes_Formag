import assert from 'node:assert/strict';
import test from 'node:test';

import type { EffectiveDoctorWorkSchedule } from '@/features/agenda/domain/types';
import { deriveAgendaWorkDates } from './agenda-creation-work-dates';

const mondayToSunday = [
  '2026-07-27',
  '2026-07-28',
  '2026-07-29',
  '2026-07-30',
  '2026-07-31',
  '2026-08-01',
  '2026-08-02',
];

const weekdaySchedule: EffectiveDoctorWorkSchedule = {
  medicoId: 12,
  error: null,
  schedule: {
    id: 4,
    nombre: 'Horario de sede',
    origen: 'SEDE',
    zonaHoraria: 'America/Bogota',
    bloques: [1, 2, 3, 4, 5].map((diaSemana) => ({
      diaSemana,
      horaInicio: '08:00',
      horaFin: '17:00',
    })),
  },
};

test('identifica sábado y domingo como no laborables antes del preview', () => {
  const result = deriveAgendaWorkDates(
    mondayToSunday,
    [12],
    [weekdaySchedule],
    {},
  );

  assert.equal(result.complete, true);
  assert.deepEqual(result.allDoctors, mondayToSunday.slice(0, 5));
  assert.deepEqual(result.byDoctor[12], mondayToSunday.slice(0, 5));
  assert.deepEqual(result.schedulesByDoctor[12][0], {
    date: '2026-07-27',
    blocks: [{ diaSemana: 1, horaInicio: '08:00', horaFin: '17:00' }],
  });
});

test('usa la unión de días laborables para exclusiones generales', () => {
  const result = deriveAgendaWorkDates(
    mondayToSunday,
    [12, 13],
    [
      weekdaySchedule,
      {
        ...weekdaySchedule,
        medicoId: 13,
        schedule: {
          ...weekdaySchedule.schedule!,
          id: 5,
          bloques: [{ diaSemana: 6, horaInicio: '08:00', horaFin: '12:00' }],
        },
      },
    ],
    {},
  );

  assert.deepEqual(result.allDoctors, mondayToSunday.slice(0, 6));
  assert.deepEqual(result.byDoctor[13], ['2026-08-01']);
});

test('la personalización temporal afecta solo la fecha indicada', () => {
  const result = deriveAgendaWorkDates(
    mondayToSunday,
    [12],
    [weekdaySchedule],
    {
      12: [
        {
          fecha: '2026-08-02',
          bloques: [{ horaInicio: '09:00', horaFin: '11:00' }],
        },
      ],
    },
  );

  assert.deepEqual(result.allDoctors, [
    ...mondayToSunday.slice(0, 5),
    '2026-08-02',
  ]);
  assert.deepEqual(result.byDoctor[12], [
    ...mondayToSunday.slice(0, 5),
    '2026-08-02',
  ]);
});

test('un festivo queda cerrado salvo que tenga una personalización temporal', () => {
  const holiday = '2026-07-27';
  const closed = deriveAgendaWorkDates(
    mondayToSunday,
    [12],
    [weekdaySchedule],
    {},
    [holiday],
  );
  const enabled = deriveAgendaWorkDates(
    mondayToSunday,
    [12],
    [weekdaySchedule],
    {
      12: [
        {
          fecha: holiday,
          bloques: [{ horaInicio: '09:00', horaFin: '11:00' }],
        },
      ],
    },
    [holiday],
  );
  const enabledDirectly = deriveAgendaWorkDates(
    mondayToSunday,
    [12],
    [weekdaySchedule],
    {},
    [holiday],
    [holiday],
  );

  assert.equal(closed.byDoctor[12].includes(holiday), false);
  assert.equal(enabled.byDoctor[12].includes(holiday), true);
  assert.equal(enabledDirectly.byDoctor[12].includes(holiday), true);
});

test('evita inferencias parciales mientras falte el horario de un médico', () => {
  const result = deriveAgendaWorkDates(
    mondayToSunday,
    [12, 13],
    [weekdaySchedule],
    {},
  );

  assert.equal(result.complete, false);
  assert.deepEqual(result.allDoctors, []);
  assert.deepEqual(result.byDoctor, {});
  assert.deepEqual(result.schedulesByDoctor, {});
});

test('ordena los bloques horarios dentro de cada fecha', () => {
  const result = deriveAgendaWorkDates(
    ['2026-07-27'],
    [12],
    [weekdaySchedule],
    {
      12: [
        {
          fecha: '2026-07-27',
          bloques: [
            { horaInicio: '13:00', horaFin: '17:00' },
            { horaInicio: '08:00', horaFin: '12:00' },
          ],
        },
      ],
    },
  );

  assert.deepEqual(result.schedulesByDoctor[12][0].blocks, [
    { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00' },
    { diaSemana: 1, horaInicio: '13:00', horaFin: '17:00' },
  ]);
});

test('expone el error del horario efectivo por médico', () => {
  const result = deriveAgendaWorkDates(
    mondayToSunday,
    [12],
    [{ medicoId: 12, schedule: null, error: 'No hay horario activo.' }],
    {},
  );

  assert.equal(result.complete, true);
  assert.deepEqual(result.schedulesByDoctor[12], []);
  assert.equal(result.errorsByDoctor[12], 'No hay horario activo.');
});

test('conserva el error del horario efectivo aunque exista una fecha temporal', () => {
  const result = deriveAgendaWorkDates(
    mondayToSunday,
    [12],
    [{ medicoId: 12, schedule: null, error: 'No hay horario activo.' }],
    {
      12: [
        {
          fecha: '2026-07-27',
          bloques: [{ horaInicio: '10:00', horaFin: '14:00' }],
        },
      ],
    },
  );

  assert.deepEqual(result.schedulesByDoctor[12], [
    {
      date: '2026-07-27',
      blocks: [{ diaSemana: 1, horaInicio: '10:00', horaFin: '14:00' }],
    },
  ]);
  assert.equal(result.errorsByDoctor[12], 'No hay horario activo.');
});
