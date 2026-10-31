import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_ANTECEDENTES_GINECOBSTETRICOS,
  countRefiereGineco,
  esMujer,
  fechaProbableParto,
  parseAntecedentesGinecobstetricos,
} from './antecedentes-ginecobstetricos';

test('inicia con NO REFIERE en los textos, la fórmula obstétrica vacía y 0 compañeros sexuales', () => {
  const datos = DEFAULT_ANTECEDENTES_GINECOBSTETRICOS;
  assert.equal(datos.textos.menarquia, 'NO REFIERE');
  assert.equal(datos.textos.conductaSuicida, 'NO REFIERE');
  assert.equal(datos.numeros.gesta, null);
  assert.equal(datos.numeros.companerosSexuales, 0);
  assert.equal(datos.fechas.fum, null);
  assert.equal(datos.observaciones, '');
  assert.equal(countRefiereGineco(datos), 0);
});

test('conserva lo diligenciado y descarta valores inválidos', () => {
  const parsed = parseAntecedentesGinecobstetricos({
    textos: { menarquia: ' 12 años ' },
    numeros: { gesta: 2, partos: -1, abortos: 'uno' },
    fechas: { fum: '2026-10-01', fup: '01/02/2020' },
  });
  assert.equal(parsed.textos.menarquia, '12 años');
  assert.equal(parsed.numeros.gesta, 2);
  assert.equal(parsed.numeros.partos, null);
  assert.equal(parsed.numeros.abortos, null);
  assert.equal(parsed.fechas.fum, '2026-10-01');
  assert.equal(parsed.fechas.fup, null);
  assert.equal(countRefiereGineco(parsed), 1);
});

test('calcula la fecha probable de parto con la regla de Naegele', () => {
  assert.equal(fechaProbableParto('2026-01-01'), '2026-10-08');
  assert.equal(fechaProbableParto(null), null);
});

test('reconoce a la docente mujer por el sexo guardado', () => {
  assert.equal(esMujer('M'), true);
  assert.equal(esMujer('f'), true);
  assert.equal(esMujer('H'), false);
  assert.equal(esMujer(null), false);
});
