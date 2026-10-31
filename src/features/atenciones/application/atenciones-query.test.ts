import assert from 'node:assert/strict';
import test from 'node:test';

import { atencionesOrderBy, buildAtencionesWhere, parseAtencionesQuery } from './atenciones-query';

test('por defecto lista los activados de todos los médicos', () => {
  const query = parseAtencionesQuery(new URLSearchParams(''));
  assert.deepEqual(query, { estado: 'ACTIVADAS', medicoId: null, documento: '', fechaDesde: null, fechaHasta: null });
  assert.deepEqual(buildAtencionesWhere(query), { AND: [{ estado: 'ASIGNADA', activadaAt: { not: null } }] });
});

test('ignora estados, médicos y fechas inválidos', () => {
  const query = parseAtencionesQuery(new URLSearchParams('estado=cerradas&medicoId=abc&fechaDesde=03/11/2026'));
  assert.equal(query.estado, 'ACTIVADAS');
  assert.equal(query.medicoId, null);
  assert.equal(query.fechaDesde, null);
});

test('combina médico, documento y rango de fechas en hora de Bogotá', () => {
  const query = parseAtencionesQuery(
    new URLSearchParams('estado=atendidas&medicoId=3&documento=1004&fechaDesde=2026-11-03&fechaHasta=2026-11-04'),
  );
  assert.deepEqual(buildAtencionesWhere(query), {
    AND: [
      { estado: 'ATENDIDA' },
      { medicoId: 3 },
      { paciente: { identificacion: { contains: '1004', mode: 'insensitive' } } },
      { inicioProgramado: { gte: new Date('2026-11-03T05:00:00.000Z'), lt: new Date('2026-11-05T05:00:00.000Z') } },
    ],
  });
});

test('"Todos" reúne activados y atendidos, sin incluir asignadas sin activar', () => {
  const where = buildAtencionesWhere(parseAtencionesQuery(new URLSearchParams('estado=TODAS')));
  assert.deepEqual(where, {
    AND: [{ OR: [{ estado: 'ASIGNADA', activadaAt: { not: null } }, { estado: 'ATENDIDA' }] }],
  });
});

test('los activados se ordenan por hora de la cita ascendente', () => {
  assert.deepEqual(atencionesOrderBy('ACTIVADAS'), [{ inicioProgramado: 'asc' }, { id: 'asc' }]);
  assert.deepEqual(atencionesOrderBy('ATENDIDAS'), [{ inicioProgramado: 'desc' }, { id: 'desc' }]);
});
