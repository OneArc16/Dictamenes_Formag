import assert from 'node:assert/strict';
import test from 'node:test';

import { EXAMEN_CATALOG } from './examen-fisico';
import { indiceCinturaCadera } from './signos-vitales';

test('cada región inicia con el hallazgo normal del formulario original', () => {
  const datos = EXAMEN_CATALOG.defaults;
  assert.equal(datos.sistemas.aspectoGeneral, 'BUEN ESTADO GENERAL');
  assert.equal(datos.sistemas.pulmones, 'VENTILADOS SIN AGREGADOS');
  assert.equal(datos.sistemas.sindromeFebril, 'No');
  assert.equal(datos.sistemas.musculoEsqueletico, '');
  assert.equal(EXAMEN_CATALOG.countModificados(datos, true), 0);
});

test('escribir en un campo que inicia vacío cuenta como hallazgo', () => {
  const datos = EXAMEN_CATALOG.parse({ sistemas: { musculoEsqueletico: 'Contractura paravertebral' } });
  assert.equal(EXAMEN_CATALOG.modificado('musculoEsqueletico', datos.sistemas.musculoEsqueletico), true);
  assert.equal(EXAMEN_CATALOG.countModificados(datos, false), 1);
});

test('los tamizajes quedan agrupados al final', () => {
  const grupos = EXAMEN_CATALOG.items.map((item) => ('grupo' in item ? item.grupo : null));
  const primero = grupos.indexOf('Tamizajes');
  assert.ok(primero > 0);
  assert.ok(grupos.slice(primero).every((grupo) => grupo === 'Tamizajes'));
});

test('calcula el índice cintura-cadera', () => {
  assert.equal(indiceCinturaCadera(85, 100), 0.85);
  assert.equal(indiceCinturaCadera(null, 100), null);
});
