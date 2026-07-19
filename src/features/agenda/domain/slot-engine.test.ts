import assert from 'node:assert/strict';
import test from 'node:test';

import { generateSlotCandidates } from './slot-engine';

const base = {
  medicoId: 7,
  sedeId: 1,
  horarioLaboralId: 2,
  fecha: '2026-07-20', // lunes
  zonaHoraria: 'America/Bogota',
  bloques: [
    { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00' },
    { diaSemana: 1, horaInicio: '13:00', horaFin: '17:00' },
  ],
};

test('genera por bloques sin crear cupos durante el almuerzo', () => {
  const slots = generateSlotCandidates({ ...base, duracionMinutos: 30 });
  assert.equal(slots.length, 16);
  assert.equal(slots[7].inicio.toISOString(), '2026-07-20T16:30:00.000Z');
  assert.equal(slots[8].inicio.toISOString(), '2026-07-20T18:00:00.000Z');
});

test('descarta los minutos sobrantes de cada bloque', () => {
  const slots = generateSlotCandidates({ ...base, duracionMinutos: 45 });
  assert.equal(slots.length, 10);
  assert.equal(slots[4].fin.toISOString(), '2026-07-20T16:45:00.000Z');
  assert.equal(slots[9].fin.toISOString(), '2026-07-20T21:45:00.000Z');
});

test('no genera candidatos cuando el dia no tiene bloques', () => {
  const slots = generateSlotCandidates({ ...base, fecha: '2026-07-21', duracionMinutos: 30 });
  assert.deepEqual(slots, []);
});
