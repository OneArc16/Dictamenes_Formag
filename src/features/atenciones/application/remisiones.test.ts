import assert from 'node:assert/strict';
import test from 'node:test';

import { aperturaCasoBloqueada } from './remisiones';

const auth = (permissions: string[]) =>
  ({ empleadoId: 3, name: 'Médica', role: 'MEDICO', perfilId: 3, perfilNombre: 'MEDICO', permissions }) as never;

test('la junta médica solo abre el caso en Dictamen con permiso de crear dictámenes', () => {
  assert.equal(aperturaCasoBloqueada(auth(['appointment.attend', 'dictamen.create'])), null);
  assert.match(aperturaCasoBloqueada(auth(['appointment.attend'])) ?? '', /permiso para abrir casos/);
});
