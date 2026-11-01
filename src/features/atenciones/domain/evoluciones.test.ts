import assert from 'node:assert/strict';
import test from 'node:test';

import { EVOLUCION_TEXTO_MAX, createEvolucionSchema } from './evoluciones';

test('la evolución exige texto y lo guarda sin espacios sobrantes', () => {
  assert.equal(createEvolucionSchema.parse({ texto: '  Paciente estable.  ' }).texto, 'Paciente estable.');
  assert.equal(createEvolucionSchema.safeParse({ texto: '   ' }).success, false);
  assert.equal(createEvolucionSchema.safeParse({}).success, false);
});

test('la evolución tiene un largo máximo y no acepta campos extra', () => {
  assert.equal(createEvolucionSchema.safeParse({ texto: 'a'.repeat(EVOLUCION_TEXTO_MAX) }).success, true);
  assert.equal(createEvolucionSchema.safeParse({ texto: 'a'.repeat(EVOLUCION_TEXTO_MAX + 1) }).success, false);
  assert.equal(createEvolucionSchema.safeParse({ texto: 'Estable', createdBy: 9 }).success, false);
});
