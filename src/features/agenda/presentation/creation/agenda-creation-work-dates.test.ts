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

test('la personalización temporal reemplaza los días del horario predeterminado', () => {
  const result = deriveAgendaWorkDates(
    mondayToSunday,
    [12],
    [weekdaySchedule],
    {
      12: [{ diaSemana: 7, horaInicio: '09:00', horaFin: '11:00' }],
    },
  );

  assert.deepEqual(result.allDoctors, ['2026-08-02']);
  assert.deepEqual(result.byDoctor[12], ['2026-08-02']);
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
});
