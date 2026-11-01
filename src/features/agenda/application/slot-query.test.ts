import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSlotWhere,
  localDayRange,
  parseSlotQuery,
  statusWhere,
  viewStatus,
  type SlotQueryFilters,
} from './slot-query';

function parse(query: string) {
  return parseSlotQuery(new URLSearchParams(query));
}

const baseFilters: SlotQueryFilters = {
  desde: '2026-11-03',
  hasta: '2026-11-30',
  medicoId: 7,
  modalidadId: null,
  estados: ['LIBRE'],
  search: 'claudia 2688',
  page: 1,
  pageSize: 100,
};

test('exige un rango de fechas válido y acotado', () => {
  assert.equal(parse('').ok, false);
  assert.equal(parse('desde=2026-11-30&hasta=2026-11-01').ok, false);
  assert.equal(parse('desde=2026-01-01&hasta=2026-04-02').ok, false);
  assert.equal(parse('desde=2026-01-01&hasta=2026-04-01').ok, true);
});

test('normaliza estados, búsqueda y paginación', () => {
  const result = parse('desde=2026-11-03&hasta=2026-11-30&estado=libre,ATENDIDO,libre&q=  ana   perez &page=0&pageSize=999');
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value.estados, ['LIBRE', 'ATENDIDO']);
  assert.equal(result.value.search, 'ana perez');
  assert.equal(result.value.page, 1);
  assert.equal(result.value.pageSize, 200);
  assert.equal(result.value.medicoId, null);
});

test('rechaza estados que no son de la vista', () => {
  assert.equal(parse('desde=2026-11-03&hasta=2026-11-30&estado=DISPONIBLE').ok, false);
  assert.equal(parse('desde=2026-11-03&hasta=2026-11-30&estado=RESERVADO').ok, false);
});

test('traduce el estado del cupo y de la cita al estado de la vista', () => {
  assert.equal(viewStatus('DISPONIBLE', null), 'LIBRE');
  assert.equal(viewStatus('ASIGNADO', 'ASIGNADA'), 'ASIGNADO');
  assert.equal(viewStatus('RESERVADO', null), 'ASIGNADO');
  assert.equal(viewStatus('ASIGNADO', 'ATENDIDA'), 'ATENDIDO');
  assert.equal(viewStatus('CANCELADO', 'ATENDIDA'), 'CANCELADO');
});

test('asignado y atendido se distinguen por la cita atendida', () => {
  const attended = { citas: { some: { estado: 'ATENDIDA' } } };
  assert.deepEqual(statusWhere('ASIGNADO'), { estado: { in: ['ASIGNADO', 'RESERVADO'] }, NOT: attended });
  assert.deepEqual(statusWhere('ATENDIDO'), { estado: { in: ['ASIGNADO', 'RESERVADO'] }, ...attended });
  assert.deepEqual(statusWhere('LIBRE'), { estado: 'DISPONIBLE' });
});

test('el rango cubre días completos en hora de Bogotá', () => {
  const range = localDayRange('2026-11-03', '2026-11-03');
  assert.equal(range.gte.toISOString(), '2026-11-03T05:00:00.000Z');
  assert.equal(range.lt.toISOString(), '2026-11-04T05:00:00.000Z');
});

test('las facetas omiten los filtros indicados', () => {
  const scope = { medicoId: null, sedeId: 2 };
  const full = buildSlotWhere(baseFilters, scope).AND as object[];
  // rango + sede + médico + estado + 2 palabras de búsqueda
  assert.equal(full.length, 6);

  const withoutStatus = buildSlotWhere(baseFilters, scope, { medico: true, search: true }).AND as object[];
  assert.equal(withoutStatus.length, 5);

  const doctorsFacet = buildSlotWhere(baseFilters, scope, {}).AND as object[];
  assert.deepEqual(doctorsFacet.slice(1), [{ sedeId: 2 }]);
});

test('la lectura propia fuerza el médico aunque se pida otro', () => {
  const where = buildSlotWhere({ ...baseFilters, medicoId: 99 }, { medicoId: 5, sedeId: null }, {}).AND as object[];
  assert.deepEqual(where.slice(1), [{ medicoId: 5 }]);
});

test('lee la modalidad de la agenda consultada', () => {
  const withModality = parse('desde=2026-11-03&hasta=2026-11-30&modalidadId=2');
  assert.equal(withModality.ok && withModality.value.modalidadId, 2);
  const withoutModality = parse('desde=2026-11-03&hasta=2026-11-30');
  assert.equal(withoutModality.ok && withoutModality.value.modalidadId, null);
});

test('la modalidad separa las agendas también en las facetas', () => {
  const scope = { medicoId: null, sedeId: 2 };
  const doctorsFacet = buildSlotWhere({ ...baseFilters, modalidadId: 2 }, scope, {}).AND as object[];
  assert.deepEqual(doctorsFacet.slice(1), [{ sedeId: 2 }, { modalidadId: 2 }]);
});
