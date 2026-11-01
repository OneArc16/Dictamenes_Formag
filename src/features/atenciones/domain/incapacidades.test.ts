import assert from 'node:assert/strict';
import test from 'node:test';

import {
  INCAPACIDAD_DIAS_MAX,
  createIncapacidadSchema,
  fechaFinIncapacidad,
  formatNumeroInterno,
  incapacidadesSeCruzan,
  totalDias,
} from './incapacidades';

const base = {
  categoria: 'ENFERMEDAD_GENERAL',
  prorroga: false,
  fechaInicio: '2026-11-05',
  dias: 3,
};

test('la incapacidad exige categoría, fecha de inicio y días', () => {
  const parsed = createIncapacidadSchema.parse({ ...base, observaciones: '  Reposo  ' });
  assert.equal(parsed.observaciones, 'Reposo');
  assert.equal(createIncapacidadSchema.safeParse({ ...base, categoria: 'OTRA' }).success, false);
  assert.equal(createIncapacidadSchema.safeParse({ ...base, fechaInicio: '05/11/2026' }).success, false);
  assert.equal(createIncapacidadSchema.safeParse({ ...base, dias: 0 }).success, false);
  assert.equal(createIncapacidadSchema.safeParse({ ...base, dias: INCAPACIDAD_DIAS_MAX + 1 }).success, false);
  assert.equal(createIncapacidadSchema.safeParse({ ...base, dias: 2.5 }).success, false);
});

test('la prórroga es solo una marca sí o no', () => {
  assert.equal(createIncapacidadSchema.parse({ ...base, prorroga: true }).prorroga, true);
  assert.equal(createIncapacidadSchema.safeParse({ ...base, prorroga: undefined }).success, false);
  assert.equal(createIncapacidadSchema.safeParse({ ...base, prorroga: true, prorrogaDeId: 4 }).success, false);
});

test('los diagnósticos vienen de la atención: la incapacidad no recibe uno propio', () => {
  assert.equal(createIncapacidadSchema.safeParse({ ...base, diagnosticoCodigo: 'M545' }).success, false);
});

test('la fecha de fin cuenta el día de inicio', () => {
  assert.equal(fechaFinIncapacidad('2026-11-05', 1), '2026-11-05');
  assert.equal(fechaFinIncapacidad('2026-11-05', 3), '2026-11-07');
  assert.equal(fechaFinIncapacidad('2026-11-30', 2), '2026-12-01');
});

test('detecta incapacidades del docente que se cruzan en fechas', () => {
  const existente = { fechaInicio: '2026-11-05', fechaFin: '2026-11-07' };
  assert.equal(incapacidadesSeCruzan(existente, { fechaInicio: '2026-11-07', fechaFin: '2026-11-09' }), true);
  assert.equal(incapacidadesSeCruzan(existente, { fechaInicio: '2026-11-01', fechaFin: '2026-11-05' }), true);
  assert.equal(incapacidadesSeCruzan(existente, { fechaInicio: '2026-11-08', fechaFin: '2026-11-09' }), false);
});

test('numera por año con cuatro dígitos y suma los días', () => {
  assert.equal(formatNumeroInterno(2026, 7), '2026-0007');
  assert.equal(formatNumeroInterno(2026, 12345), '2026-12345');
  assert.equal(totalDias([{ dias: 3 }, { dias: 10 }]), 13);
});
