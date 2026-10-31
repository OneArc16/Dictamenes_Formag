import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FILAS_INICIALES,
  codigosRepetidos,
  diagnosticosParaGuardar,
  filaVacia,
  filasIniciales,
  saveDiagnosticosSchema,
} from './diagnosticos';

const fila = (cie10Codigo: string) => ({ ...filaVacia(), cie10Codigo, cie10Label: cie10Codigo });

test('sin diagnósticos guardados inicia con el principal y dos relacionados vacíos', () => {
  const filas = filasIniciales([]);
  assert.equal(filas.length, FILAS_INICIALES);
  assert.ok(filas.every((item) => item.cie10Codigo === '' && item.tipo === 'IMPRESION_DIAGNOSTICA'));
  assert.equal(new Set(filas.map((item) => item.id)).size, FILAS_INICIALES);
});

test('guarda solo las filas con código, en orden', () => {
  assert.deepEqual(diagnosticosParaGuardar([fila(''), fila('I10X'), fila('E119')]), [
    { cie10Codigo: 'I10X', tipo: 'IMPRESION_DIAGNOSTICA' },
    { cie10Codigo: 'E119', tipo: 'IMPRESION_DIAGNOSTICA' },
  ]);
});

test('detecta códigos repetidos', () => {
  assert.deepEqual([...codigosRepetidos([fila('I10X'), fila('i10x'), fila('E119')])], ['I10X']);
  assert.equal(
    saveDiagnosticosSchema.safeParse({
      diagnosticos: [
        { cie10Codigo: 'I10X', tipo: 'CONFIRMADO_NUEVO' },
        { cie10Codigo: 'I10X', tipo: 'IMPRESION_DIAGNOSTICA' },
      ],
    }).success,
    false,
  );
});

test('rechaza tipos desconocidos y más de 10 diagnósticos', () => {
  assert.equal(
    saveDiagnosticosSchema.safeParse({ diagnosticos: [{ cie10Codigo: 'I10X', tipo: 'OTRO' }] }).success,
    false,
  );
  const once = Array.from({ length: 11 }, (_, index) => ({ cie10Codigo: `A${index}`, tipo: 'CONFIRMADO_NUEVO' }));
  assert.equal(saveDiagnosticosSchema.safeParse({ diagnosticos: once }).success, false);
  assert.equal(saveDiagnosticosSchema.safeParse({ diagnosticos: [] }).success, true);
});
