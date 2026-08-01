import assert from 'node:assert/strict';
import test from 'node:test';

import { ReceptionError } from '@/features/reception/application/errors';
import { assertReceptionRequestIntegrity } from './with-reception-api';

function request(headers: HeadersInit = {}, method = 'POST') {
  return new Request('https://app.example.test/api/reception/appointments', { method, headers });
}

test('permite lecturas sin token anti-CSRF', () => {
  assert.doesNotThrow(() => assertReceptionRequestIntegrity(request({}, 'GET')));
});

test('rechaza una mutación de origen cruzado', () => {
  assert.throws(() => assertReceptionRequestIntegrity(request({ origin: 'https://malicioso.example', 'sec-fetch-site': 'cross-site' })), (error: unknown) => error instanceof ReceptionError && error.code === 'UNTRUSTED_ORIGIN');
});

test('permite una mutación del origen confiable', () => {
  assert.doesNotThrow(() => assertReceptionRequestIntegrity(request({ origin: 'https://app.example.test', 'sec-fetch-site': 'same-origin' })));
});

test('acepta el host público reenviado, aunque el servidor escuche en otra interfaz', () => {
  const proxied = new Request('http://0.0.0.0:3001/api/reception/appointments', { method: 'POST', headers: { host: 'localhost:3001', origin: 'http://localhost:3001', 'sec-fetch-site': 'same-origin' } });
  assert.doesNotThrow(() => assertReceptionRequestIntegrity(proxied));
});

test('usa el token doble envío cuando faltan Origin y Fetch Metadata', () => {
  assert.doesNotThrow(() => assertReceptionRequestIntegrity(request({ cookie: 'reception_csrf=token-seguro', 'x-csrf-token': 'token-seguro' })));
  assert.throws(() => assertReceptionRequestIntegrity(request({ cookie: 'reception_csrf=token-seguro', 'x-csrf-token': 'otro-token' })), (error: unknown) => error instanceof ReceptionError && error.code === 'CSRF_TOKEN_REQUIRED');
});
