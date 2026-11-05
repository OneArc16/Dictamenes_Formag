import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { capPcl, PCL_MAX } from './pcl-cap';
import { computeTitulo3Summary } from './titulo3';

describe('capPcl', () => {
  it('never lets the PCL go over 100%', () => {
    assert.equal(PCL_MAX, 100);
    assert.equal(capPcl(118.14), 100);
    assert.equal(capPcl(100), 100);
  });

  it('keeps values up to 100% and empty values as they are', () => {
    assert.equal(capPcl(89.5), 89.5);
    assert.equal(capPcl(null), null);
  });
});

describe('computeTitulo3Summary', () => {
  it('caps the final PCL at 100% while keeping the Title III increment', () => {
    const summary = computeTitulo3Summary({
      basePcl: 89.5,
      items: [{ factor: 'ATENCION', gravedad: 'IV' }],
    });
    assert.equal(summary.pclFinal, 100);
    assert.equal(summary.incrementoTitulo3 > 0, true);
  });
});
