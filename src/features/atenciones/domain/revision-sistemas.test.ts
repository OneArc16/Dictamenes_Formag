import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_REVISION_SISTEMAS,
  countSistemasModificados,
  parseRevisionSistemas,
  sistemaModificado,
} from './revision-sistemas';

test('cada sistema inicia con su hallazgo normal', () => {
  assert.equal(DEFAULT_REVISION_SISTEMAS.sistemas.general, 'BUEN ESTADO GENERAL');
  assert.equal(DEFAULT_REVISION_SISTEMAS.sistemas.cuello, 'No refiere dolor, rigidez, presencia de masas');
  assert.equal(DEFAULT_REVISION_SISTEMAS.fecha, null);
  assert.equal(countSistemasModificados(DEFAULT_REVISION_SISTEMAS, true), 0);
});

test('conserva lo escrito y completa lo que falte', () => {
  const parsed = parseRevisionSistemas({ sistemas: { cabeza: ' Cefalea frontal ', ojos: 3 } });
  assert.equal(parsed.sistemas.cabeza, 'Cefalea frontal');
  assert.equal(parsed.sistemas.ojos, DEFAULT_REVISION_SISTEMAS.sistemas.ojos);
  assert.equal(countSistemasModificados(parsed, false), 1);
});

test('un cambio solo de mayúsculas o espacios no cuenta como hallazgo', () => {
  assert.equal(sistemaModificado('hematopoyetico', '  NO   REFIERE '), false);
  assert.equal(sistemaModificado('hematopoyetico', 'Anemia en tratamiento'), true);
});

test('el sistema ginecológico solo cuenta para mujeres', () => {
  const parsed = parseRevisionSistemas({ sistemas: { ginecologico: 'Dismenorrea' } });
  assert.equal(countSistemasModificados(parsed, true), 1);
  assert.equal(countSistemasModificados(parsed, false), 0);
});
