import assert from 'node:assert/strict';
import test from 'node:test';

import { CUPS_JUNTA_MEDICA, createRemisionSchema, diagnosticosCasoJunta, esJuntaMedica, estadoAtajos } from './remisiones';

test('la remisión exige servicio CUPS y diagnóstico; los relacionados son opcionales', () => {
  assert.equal(createRemisionSchema.safeParse({ cupsCodigo: '890264', diagnosticoCodigo: 'i10x' }).success, true);
  assert.equal(createRemisionSchema.safeParse({ cupsCodigo: '890264' }).success, false);
  const parsed = createRemisionSchema.parse({
    cupsCodigo: ' 890264 ',
    diagnosticoCodigo: 'i10x',
    relacionado2Codigo: null,
  });
  assert.equal(parsed.diagnosticoCodigo, 'I10X');
  assert.equal(parsed.cupsCodigo, '890264');
});

test('no permite repetir el mismo diagnóstico en una remisión', () => {
  assert.equal(
    createRemisionSchema.safeParse({ cupsCodigo: '890264', diagnosticoCodigo: 'I10X', relacionado2Codigo: 'i10x' })
      .success,
    false,
  );
});

test('los atajos quedan en verde cuando su servicio ya está cargado', () => {
  const atajos = [
    { cupsCodigo: 'A', etiqueta: 'Control medicina laboral', cupsNombre: 'Control' },
    { cupsCodigo: 'B', etiqueta: 'Junta médica', cupsNombre: 'Junta' },
  ];
  assert.deepEqual(
    estadoAtajos(atajos, [{ cups: { codigo: 'B', nombre: 'Junta' } }]).map((atajo) => atajo.cargado),
    [false, true],
  );
});

test('la junta médica exige primera vez o recalificación; los demás servicios no lo admiten', () => {
  const junta = { cupsCodigo: CUPS_JUNTA_MEDICA, diagnosticoCodigo: 'F067' };
  assert.equal(createRemisionSchema.safeParse(junta).success, false);
  assert.equal(createRemisionSchema.parse({ ...junta, tipoDictamen: 'CALIFICACION' }).tipoDictamen, 'CALIFICACION');
  assert.equal(createRemisionSchema.safeParse({ ...junta, tipoDictamen: 'RECALIFICACION' }).success, true);
  assert.equal(createRemisionSchema.safeParse({ ...junta, tipoDictamen: 'OTRO' }).success, false);
  assert.equal(
    createRemisionSchema.safeParse({ cupsCodigo: '890362', diagnosticoCodigo: 'F067', tipoDictamen: 'CALIFICACION' }).success,
    false,
  );
  assert.equal(esJuntaMedica(' 890502 '), true);
  assert.equal(esJuntaMedica('890362'), false);
});

test('diagnosticosCasoJunta carries the junta remission diagnoses in order, principal first', () => {
  const result = diagnosticosCasoJunta(['M545', 'F329', 'J00'], [
    { cie10Codigo: 'F329', tipo: 'CONFIRMADO_NUEVO' },
    { cie10Codigo: 'M545', tipo: 'CONFIRMADO_REPETIDO' },
  ]);
  assert.deepEqual(result, [
    { cie10Codigo: 'M545', tipo: 'CONFIRMADO_REPETIDO', esPrincipal: true, orden: 1 },
    { cie10Codigo: 'F329', tipo: 'CONFIRMADO_NUEVO', esPrincipal: false, orden: 2 },
    { cie10Codigo: 'J00', tipo: 'IMPRESION_DIAGNOSTICA', esPrincipal: false, orden: 3 },
  ]);
});

test('diagnosticosCasoJunta skips empty and repeated codes', () => {
  const result = diagnosticosCasoJunta(['M545', null, 'M545', undefined], []);
  assert.deepEqual(result, [{ cie10Codigo: 'M545', tipo: 'IMPRESION_DIAGNOSTICA', esPrincipal: true, orden: 1 }]);
});
