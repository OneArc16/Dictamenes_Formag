import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseReceptionPolicyId } from './[id]/deactivate/route';

describe('parseReceptionPolicyId', () => {
  it('accepts only positive decimal database identifiers', () => {
    assert.equal(parseReceptionPolicyId('16'), 16);
    assert.equal(parseReceptionPolicyId('0x10'), null);
    assert.equal(parseReceptionPolicyId('1e2'), null);
    assert.equal(parseReceptionPolicyId('2147483648'), null);
  });
});
