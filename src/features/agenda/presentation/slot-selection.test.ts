import assert from 'node:assert/strict';
import test from 'node:test';

import {
  availableSlotIds,
  filterAgendaSlots,
  toggleAllAvailableSlots,
} from './slot-selection';

test('selecciona únicamente los cupos disponibles', () => {
  const ids = availableSlotIds([
    { id: 1, estado: 'DISPONIBLE' },
    { id: 2, estado: 'RESERVADO' },
    { id: 3, estado: 'ASIGNADO' },
    { id: 4, estado: 'CANCELADO' },
    { id: 5, estado: 'DISPONIBLE' },
  ]);

  assert.deepEqual(ids, [1, 5]);
});

test('selecciona todos los disponibles y conserva selecciones ajenas', () => {
  const result = toggleAllAvailableSlots(new Set([99]), [1, 5]);

  assert.deepEqual([...result].sort((left, right) => left - right), [1, 5, 99]);
});

test('deselecciona los disponibles cuando todos ya estaban seleccionados', () => {
  const result = toggleAllAvailableSlots(new Set([1, 5, 99]), [1, 5]);

  assert.deepEqual([...result], [99]);
});

test('filtra cupos por médico y fecha en la zona horaria de la agenda', () => {
  const slots = [
    { id: 1, medicoId: 12, inicio: '2026-07-29T04:30:00.000Z' },
    { id: 2, medicoId: 12, inicio: '2026-07-29T13:00:00.000Z' },
    { id: 3, medicoId: 13, inicio: '2026-07-29T14:00:00.000Z' },
  ];

  const result = filterAgendaSlots(
    slots,
    { medicoId: 12, date: '2026-07-28' },
    'America/Bogota',
  );

  assert.deepEqual(result.map((slot) => slot.id), [1]);
});
