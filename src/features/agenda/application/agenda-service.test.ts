import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyCandidates } from './agenda-service';

test('omite cupos existentes superpuestos y conserva los candidatos faltantes', () => {
  const existingStart = new Date('2030-02-04T14:15:00.000Z');
  const existingEnd = new Date('2030-02-04T14:45:00.000Z');
  const missingStart = new Date('2030-02-04T15:00:00.000Z');
  const missingEnd = new Date('2030-02-04T15:30:00.000Z');

  const result = classifyCandidates(
    [
      {
        medicoId: 12,
        sedeId: 3,
        horarioLaboralId: 4,
        fecha: '2030-02-04',
        inicio: new Date('2030-02-04T14:00:00.000Z'),
        fin: new Date('2030-02-04T14:30:00.000Z'),
        duracionMinutos: 30,
      },
      {
        medicoId: 12,
        sedeId: 3,
        horarioLaboralId: 4,
        fecha: '2030-02-04',
        inicio: missingStart,
        fin: missingEnd,
        duracionMinutos: 30,
      },
    ],
    [
      {
        id: 99,
        medicoId: 12,
        modalidadId: 2,
        inicio: existingStart,
        fin: existingEnd,
      },
    ],
    new Date('2030-02-04T13:00:00.000Z'),
  );

  assert.equal(result.omitted, 1);
  assert.equal('conflicts' in result, false);
  assert.deepEqual(result.newSlots.map((slot) => slot.inicio), [missingStart]);
});
