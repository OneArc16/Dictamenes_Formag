import assert from 'node:assert/strict';
import test from 'node:test';

import { wrapLongPdfTokens } from './FormularioOrigenPdf';

test('wraps an unbroken PDF value before it overflows its cell', () => {
  assert.equal(
    wrapLongPdfTokens('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8),
    'ABCDEFGH\nIJKLMNOP\nQRSTUVWX\nYZ',
  );
});

test('preserves regular words and existing line breaks', () => {
  assert.equal(wrapLongPdfTokens('Texto normal\ncon saltos', 8), 'Texto normal\ncon saltos');
});
