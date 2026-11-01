import assert from 'node:assert/strict';
import test from 'node:test';

import {
  chunk,
  formatDayHeading,
  formatTime,
  groupSlotsByDay,
  initials,
  presetRange,
  todayInAgendaZone,
  type AgendaSlotRow,
} from './agenda-slots-view';

function slot(id: number, inicio: string, estado: AgendaSlotRow['estado'] = 'LIBRE'): AgendaSlotRow {
  return {
    id,
    medicoId: 1,
    medicoNombre: 'ANA PEREZ',
    sedeNombre: 'Sede',
    modalidadNombre: 'Presencial',
    inicio,
    fin: inicio,
    duracionMinutos: 30,
    estado,
    generacionId: 1,
    paciente: null,
    cancelacion: null,
  };
}

test('los presets calculan rangos inclusivos', () => {
  assert.deepEqual(presetRange('hoy', '2026-11-03'), { desde: '2026-11-03', hasta: '2026-11-03' });
  assert.deepEqual(presetRange('semana', '2026-11-28'), { desde: '2026-11-28', hasta: '2026-12-04' });
  assert.deepEqual(presetRange('mes', '2026-02-10'), { desde: '2026-02-01', hasta: '2026-02-28' });
  assert.deepEqual(presetRange('treinta', '2026-11-03'), { desde: '2026-11-03', hasta: '2026-12-02' });
});

test('hoy se calcula en hora de Bogotá', () => {
  // 03:00 UTC del 4 de noviembre son las 22:00 del 3 de noviembre en Bogotá.
  assert.equal(todayInAgendaZone(new Date('2026-11-04T03:00:00.000Z')), '2026-11-03');
});

test('agrupa por día local y cuenta disponibles', () => {
  const groups = groupSlotsByDay([
    slot(1, '2026-11-03T12:00:00.000Z'),
    slot(2, '2026-11-04T02:00:00.000Z', 'CANCELADO'), // 21:00 del día 3 en Bogotá
    slot(3, '2026-11-04T12:00:00.000Z'),
  ]);
  assert.deepEqual(groups.map((group) => [group.date, group.slots.length, group.available]), [
    ['2026-11-03', 2, 1],
    ['2026-11-04', 1, 1],
  ]);
});

test('formatea fechas, horas e iniciales', () => {
  assert.equal(formatDayHeading('2026-11-03'), 'Martes, 3 de noviembre de 2026');
  assert.equal(formatTime('2026-11-03T12:00:00.000Z'), '07:00');
  assert.equal(initials('CLAUDIA PATRICIA YEJAS OROZCO'), 'CY');
  assert.equal(initials('ANA PEREZ'), 'AP');
});

test('divide en lotes', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});
