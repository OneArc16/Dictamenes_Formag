import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_ANTECEDENTES_FAMILIARES,
  FAMILIAR_KEYS,
  countRefiereFamiliares,
  parseAntecedentesFamiliares,
} from './antecedentes-familiares';

test('un docente sin antecedentes familiares queda con NO REFIERE en cada campo', () => {
  assert.ok(FAMILIAR_KEYS.every((key) => DEFAULT_ANTECEDENTES_FAMILIARES.items[key] === 'NO REFIERE'));
  assert.equal(DEFAULT_ANTECEDENTES_FAMILIARES.fechaAntecedente, null);
  assert.equal(countRefiereFamiliares(DEFAULT_ANTECEDENTES_FAMILIARES), 0);
  assert.equal(FAMILIAR_KEYS.length, new Set(FAMILIAR_KEYS).size);
});

test('conserva lo escrito y completa lo que falte o no sea texto', () => {
  const parsed = parseAntecedentesFamiliares({
    items: { diabetes: ' Madre, tipo 2 ', cancer: null },
    fechaAntecedente: '2025-09-19',
  });
  assert.equal(parsed.items.diabetes, 'Madre, tipo 2');
  assert.equal(parsed.items.cancer, 'NO REFIERE');
  assert.equal(parsed.fechaAntecedente, '2025-09-19');
  assert.equal(countRefiereFamiliares(parsed), 1);
});
