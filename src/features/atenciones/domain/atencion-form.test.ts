import assert from 'node:assert/strict';
import test from 'node:test';

import { ATENCION_TEXT_MAX, atencionPendientes, saveAtencionSchema } from './atencion-form';

test('la enfermedad actual es obligatoria para finalizar; el motivo de consulta no', () => {
  assert.deepEqual(
    atencionPendientes({ motivoConsulta: 'Control', enfermedadActual: '   ' }).map((item) => item.field),
    ['enfermedadActual'],
  );
  assert.deepEqual(atencionPendientes({ motivoConsulta: '', enfermedadActual: 'Dolor lumbar' }), []);
});

test('el guardado acepta campos parciales y rechaza vacíos, desconocidos o demasiado largos', () => {
  assert.equal(saveAtencionSchema.safeParse({ motivoConsulta: 'Control' }).success, true);
  assert.equal(saveAtencionSchema.safeParse({}).success, false);
  assert.equal(saveAtencionSchema.safeParse({ diagnostico: 'x' }).success, false);
  assert.equal(saveAtencionSchema.safeParse({ enfermedadActual: 'a'.repeat(ATENCION_TEXT_MAX + 1) }).success, false);
});
