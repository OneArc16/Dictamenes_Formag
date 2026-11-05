import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { nextHighlightedIndex } from './SearchableSelect';

describe('nextHighlightedIndex', () => {
  it('selects the first filtered option after ArrowDown', () => {
    assert.equal(nextHighlightedIndex(-1, 1, 1), 0);
  });

  it('wraps keyboard navigation within the filtered options', () => {
    assert.equal(nextHighlightedIndex(1, 1, 2), 0);
    assert.equal(nextHighlightedIndex(0, -1, 2), 1);
  });
});
