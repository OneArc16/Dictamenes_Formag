import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EMPTY_SIGNOS,
  alertaSigno,
  calcularImc,
  clasificarImc,
  signosPendientes,
  signosToForm,
  signosVitalesSchema,
  validateSignos,
} from './signos-vitales';

const form = (patch: Record<string, string>) => ({ ...signosToForm(EMPTY_SIGNOS), ...patch });

test('acepta coma decimal y valida rangos y decimales', () => {
  const { values, errors } = validateSignos(
    form({ temperatura: '36,5', pesoKg: '70', tallaCm: '177', saturacion: '120', frecuenciaCardiaca: '62.5' }),
  );
  assert.equal(values.temperatura, 36.5);
  assert.equal(values.pesoKg, 70);
  assert.equal(values.saturacion, null);
  assert.match(errors.saturacion ?? '', /Entre 50 y 100/);
  assert.equal(errors.frecuenciaCardiaca, 'Sin decimales');
});

test('la diastólica debe ser menor que la sistólica', () => {
  const { values, errors } = validateSignos(form({ presionSistolica: '80', presionDiastolica: '120' }));
  assert.equal(values.presionDiastolica, null);
  assert.match(errors.presionDiastolica ?? '', /menor que la sistólica/);
});

test('rechaza texto no numérico', () => {
  assert.equal(
    validateSignos(form({ frecuenciaRespiratoria: 'diez' })).errors.frecuenciaRespiratoria,
    'Escribe solo números',
  );
});

test('calcula y clasifica el IMC', () => {
  assert.equal(calcularImc(70, 177), 22.34);
  assert.equal(clasificarImc(22.34)?.label, 'Normal');
  assert.equal(clasificarImc(31)?.label, 'Obesidad');
  assert.equal(calcularImc(null, 177), null);
});

test('los obligatorios pendientes impiden finalizar; los perímetros no', () => {
  assert.equal(signosPendientes(EMPTY_SIGNOS).length, 8);
  const completos = {
    ...EMPTY_SIGNOS,
    presionSistolica: 120,
    presionDiastolica: 80,
    frecuenciaCardiaca: 62,
    frecuenciaRespiratoria: 17,
    temperatura: 36,
    saturacion: 99,
    pesoKg: 70,
    tallaCm: 177,
  };
  assert.deepEqual(signosPendientes(completos), []);
});

test('marca alertas fuera de lo esperado', () => {
  const values = { ...EMPTY_SIGNOS, presionSistolica: 150, frecuenciaCardiaca: 62, temperatura: 38.2, saturacion: 92 };
  assert.equal(alertaSigno('presionSistolica', values), 'Alta');
  assert.equal(alertaSigno('frecuenciaCardiaca', values), null);
  assert.equal(alertaSigno('temperatura', values), 'Fiebre');
  assert.equal(alertaSigno('saturacion', values), 'Baja');
});

test('el servidor aplica los mismos rangos', () => {
  assert.equal(signosVitalesSchema.safeParse({ ...EMPTY_SIGNOS, saturacion: 99 }).success, true);
  assert.equal(signosVitalesSchema.safeParse({ ...EMPTY_SIGNOS, saturacion: 101 }).success, false);
  assert.equal(signosVitalesSchema.safeParse({ ...EMPTY_SIGNOS, otro: 1 }).success, false);
});
