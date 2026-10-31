import assert from 'node:assert/strict';
import test from 'node:test';

import { cancelSlotsSchema, restoreSlotSchema } from '@/features/agenda/domain/validation';
import { restorationBlocker } from './slot-restoration';

const now = new Date('2026-11-03T10:00:00.000Z');
const cancelled = {
  estado: 'CANCELADO',
  inicio: new Date('2026-11-03T12:00:00.000Z'),
  fin: new Date('2026-11-03T12:30:00.000Z'),
};

test('permite revertir un cupo cancelado futuro sin cruces', () => {
  assert.equal(restorationBlocker(cancelled, [], now), null);
});

test('solo revierte cupos cancelados', () => {
  assert.match(restorationBlocker({ ...cancelled, estado: 'DISPONIBLE' }, [], now) ?? '', /Solo se pueden revertir/);
});

test('no revierte cupos cuya hora ya pasó', () => {
  assert.match(restorationBlocker(cancelled, [], new Date('2026-11-03T12:00:00.000Z')) ?? '', /ya pasó/);
});

test('bloquea si otro cupo activo del médico se cruza, indicando su horario en Bogotá', () => {
  const overlap = { inicio: new Date('2026-11-03T12:00:00.000Z'), fin: new Date('2026-11-03T12:20:00.000Z') };
  assert.equal(
    restorationBlocker(cancelled, [overlap], now),
    'El médico ya tiene otro cupo activo de 07:00 a 07:20 que se cruza con este horario.',
  );
});

test('cancelar y revertir exigen un motivo de al menos 5 caracteres', () => {
  assert.equal(cancelSlotsSchema.safeParse({ cupoIds: [1] }).success, false);
  assert.equal(cancelSlotsSchema.safeParse({ cupoIds: [1], motivo: '   abc  ' }).success, false);
  assert.equal(cancelSlotsSchema.safeParse({ cupoIds: [1], motivo: 'Capacitación' }).success, true);
  assert.equal(restoreSlotSchema.safeParse({ cupoId: 1, motivo: '' }).success, false);
  assert.equal(restoreSlotSchema.safeParse({ cupoId: 1, motivo: 'Se canceló por error' }).success, true);
});
