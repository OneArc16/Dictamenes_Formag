import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalPayloadMac } from './appointment-idempotency';

test('el MAC de idempotencia es estable para comandos canónicamente equivalentes', () => {
  const previous = process.env.RECEPTION_IDEMPOTENCY_HMAC_KEY;
  process.env.RECEPTION_IDEMPOTENCY_HMAC_KEY = 'clave-de-prueba-de-idempotencia-con-entropia-suficiente';
  try {
    assert.equal(canonicalPayloadMac({ slotId: 22, patientId: 4, nested: { medium: 'PRESENCIAL', flags: [true, false] } }), canonicalPayloadMac({ nested: { flags: [true, false], medium: 'PRESENCIAL' }, patientId: 4, slotId: 22 }));
    assert.notEqual(canonicalPayloadMac({ slotId: 22, patientId: 4 }), canonicalPayloadMac({ slotId: 23, patientId: 4 }));
  } finally {
    if (previous === undefined) delete process.env.RECEPTION_IDEMPOTENCY_HMAC_KEY;
    else process.env.RECEPTION_IDEMPOTENCY_HMAC_KEY = previous;
  }
});

test('el MAC no se calcula si falta el secreto institucional', () => {
  const previous = process.env.RECEPTION_IDEMPOTENCY_HMAC_KEY;
  delete process.env.RECEPTION_IDEMPOTENCY_HMAC_KEY;
  try {
    assert.throws(() => canonicalPayloadMac({ id: 1 }), { message: 'La idempotencia no está configurada de forma segura.' });
  } finally {
    if (previous !== undefined) process.env.RECEPTION_IDEMPOTENCY_HMAC_KEY = previous;
  }
});
