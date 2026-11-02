import assert from 'node:assert/strict';
import { test } from 'node:test';

import { edadEn, edadPaciente, fechaBogota, fechaDb } from './edad';

test('cumple años el mismo día de la referencia, no antes', () => {
  assert.equal(edadEn('2002-10-13', '2026-10-12'), 23);
  assert.equal(edadEn('2002-10-13', '2026-10-13'), 24);
  assert.equal(edadEn('2002-10-13', '2029-11-02'), 27);
});

test('nacido el 29 de febrero cumple el 1 de marzo en años no bisiestos', () => {
  assert.equal(edadEn('2000-02-29', '2025-02-28'), 24);
  assert.equal(edadEn('2000-02-29', '2025-03-01'), 25);
  assert.equal(edadEn('2000-02-29', '2028-02-29'), 28);
});

test('sin fecha de nacimiento o con una posterior a la referencia no hay edad calculada', () => {
  assert.equal(edadEn(null, '2026-10-13'), null);
  assert.equal(edadEn('2030-01-01', '2026-10-13'), null);
});

test('la edad del paciente usa la fecha de nacimiento y solo sin ella el valor guardado', () => {
  assert.equal(edadPaciente({ fechaNacimiento: '2002-10-13', edad: 24 }, '2029-11-02'), 27);
  assert.equal(edadPaciente({ fechaNacimiento: null, edad: 24 }, '2029-11-02'), 24);
  assert.equal(edadPaciente({ fechaNacimiento: null, edad: null }, '2029-11-02'), null);
});

test('las fechas solo-fecha se leen en UTC y los instantes en el calendario de Colombia', () => {
  // Una columna @db.Date llega como medianoche UTC: no debe correrse al día anterior.
  assert.equal(fechaDb(new Date('2026-10-30T00:00:00.000Z')), '2026-10-30');
  // 02:00 UTC del 31 todavía es el 30 en Bogotá.
  assert.equal(fechaBogota(new Date('2026-10-31T02:00:00.000Z')), '2026-10-30');
  assert.equal(fechaDb(null), null);
});
