import assert from 'node:assert/strict';
import test from 'node:test';

import { bogotaDayRange } from './reception-service';

test('el día de la cita se corta a medianoche de Bogotá', () => {
  const range = bogotaDayRange('2026-11-12');
  assert.equal(range.gte.toISOString(), '2026-11-12T05:00:00.000Z');
  assert.equal(range.lt.toISOString(), '2026-11-13T05:00:00.000Z');
});

test('el último día del mes pasa al primero del siguiente', () => {
  assert.equal(bogotaDayRange('2026-11-30').lt.toISOString(), '2026-12-01T05:00:00.000Z');
});
