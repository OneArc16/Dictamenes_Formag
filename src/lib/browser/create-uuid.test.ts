import assert from 'node:assert/strict';
import test from 'node:test';

import { createUuidV4 } from './create-uuid';

test('uses randomUUID when it is available', () => {
  assert.equal(createUuidV4({ randomUUID: () => 'native-uuid', getRandomValues: () => new Uint8Array() }), 'native-uuid');
});

test('creates a valid UUID v4 when randomUUID is unavailable', () => {
  const uuid = createUuidV4({ getRandomValues: (values: Uint8Array) => {
    values.set(Array.from({ length: 16 }, (_, index) => index));
    return values;
  } });

  assert.equal(uuid, '00010203-0405-4607-8809-0a0b0c0d0e0f');
  assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
