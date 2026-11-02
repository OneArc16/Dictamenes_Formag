import assert from 'node:assert/strict';
import { test } from 'node:test';

import { edadAlDictamenOrigen } from './edad-origen';

const fecha = (value: string) => new Date(`${value}T00:00:00.000Z`);

test('la edad del formulario de origen es la que tenía el docente en la fecha del dictamen de origen', () => {
  // Edad guardada desactualizada (24); el dictamen de origen es tres años después del registro.
  const docente = { fechaNacimiento: fecha('2002-10-13'), edad: 24 };
  assert.equal(edadAlDictamenOrigen(docente, fecha('2029-10-12')), 26);
  assert.equal(edadAlDictamenOrigen(docente, fecha('2029-10-13')), 27);
});

test('sin fecha de nacimiento queda la edad guardada', () => {
  assert.equal(edadAlDictamenOrigen({ fechaNacimiento: null, edad: 24 }, fecha('2029-10-13')), 24);
});
