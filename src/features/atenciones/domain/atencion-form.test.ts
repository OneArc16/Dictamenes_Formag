import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EMPTY_ATENCION_FORM,
  atencionFormFromRecord,
  atencionPendientes,
  saveAtencionSchema,
} from './atencion-form';

test('enfermedad actual y tratamiento son obligatorios para finalizar; motivo, análisis y plan no', () => {
  assert.deepEqual(
    atencionPendientes({ ...EMPTY_ATENCION_FORM, motivoConsulta: 'Control', enfermedadActual: '   ' }).map(
      (item) => item.field,
    ),
    ['enfermedadActual', 'tratamiento'],
  );
  assert.deepEqual(
    atencionPendientes({
      ...EMPTY_ATENCION_FORM,
      enfermedadActual: 'Dolor lumbar',
      tratamiento: 'Control de enfermería',
    }),
    [],
  );
});

test('el guardado acepta campos parciales y rechaza vacíos o desconocidos', () => {
  assert.equal(saveAtencionSchema.safeParse({ motivoConsulta: 'Control' }).success, true);
  assert.equal(saveAtencionSchema.safeParse({ plan: 'Control en 3 meses' }).success, true);
  assert.equal(saveAtencionSchema.safeParse({}).success, false);
  assert.equal(saveAtencionSchema.safeParse({ diagnostico: 'x' }).success, false);
});

test('el guardado no limita la cantidad de caracteres', () => {
  assert.equal(saveAtencionSchema.safeParse({ enfermedadActual: 'a'.repeat(50_000) }).success, true);
});

test('lee los campos guardados y deja vacío lo que no existe', () => {
  assert.deepEqual(atencionFormFromRecord({ analisis: 'Paciente estable', plan: null }), {
    ...EMPTY_ATENCION_FORM,
    analisis: 'Paciente estable',
  });
  assert.deepEqual(atencionFormFromRecord(null), EMPTY_ATENCION_FORM);
});
