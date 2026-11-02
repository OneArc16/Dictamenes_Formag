import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ATENCION_TABS, siguientePestana } from './atencion-tabs';

test('siguientePestana avanza a la pestaña que sigue en el orden', () => {
  assert.equal(siguientePestana('motivo-consulta'), 'antecedentes');
  assert.equal(siguientePestana('analisis-plan'), 'remisiones');
});

test('siguientePestana devuelve null en la última pestaña', () => {
  assert.equal(siguientePestana(ATENCION_TABS[ATENCION_TABS.length - 1].id), null);
});
