import assert from 'node:assert/strict';
import test from 'node:test';

import { CUPS_JUNTA_MEDICA, createRemisionSchema, esJuntaMedica, estadoAtajos } from './remisiones';

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
