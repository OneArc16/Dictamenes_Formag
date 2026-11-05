import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FIXED_SUPPORTS, withUnfilledSupportsAsNotApplicable } from './supports';
import type { SoporteRow } from './types';

const filled: SoporteRow = {
  id: 7,
  tipo: 'DESCRIPCION_EVENTO',
  estado: 'APORTADO',
  fechaDocumento: '2026-11-01',
  seTuvoEnCuenta: 'Sí',
  nombreOtro: null,
};

describe('withUnfilledSupportsAsNotApplicable', () => {
  it('marks every fixed support left empty as N.A. once at least one was filled', () => {
    const result = withUnfilledSupportsAsNotApplicable([filled]);
    assert.equal(result.length, FIXED_SUPPORTS.length);
    assert.deepEqual(result.find((support) => support.tipo === 'DESCRIPCION_EVENTO'), filled);
    for (const support of result.filter((item) => item.tipo !== 'DESCRIPCION_EVENTO')) {
      assert.equal(support.estado, 'NO_APLICA');
      assert.equal(support.fechaDocumento, null);
      assert.equal(support.seTuvoEnCuenta, null);
    }
  });

  it('leaves the supports untouched when none was filled', () => {
    assert.deepEqual(withUnfilledSupportsAsNotApplicable([]), []);
  });

  it('does not add "Otros" rows', () => {
    const result = withUnfilledSupportsAsNotApplicable([filled]);
    assert.equal(result.some((support) => support.tipo === 'OTRO'), false);
  });
});
