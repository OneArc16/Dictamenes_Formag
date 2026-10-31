import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_ANTECEDENTES_PERSONALES,
  DETAIL_KEYS,
  ITEM_KEYS,
  countRefiere,
  esFumador,
  indicePaquetesAnio,
  parseAntecedentesPersonales,
  refiere,
} from './antecedentes-personales';

test('un docente sin antecedentes registrados queda con NO REFIERE escrito en cada campo', () => {
  const datos = DEFAULT_ANTECEDENTES_PERSONALES;
  assert.equal(datos.items.diabetes, 'NO REFIERE');
  assert.equal(datos.items.alergicos, 'NO REFIERE');
  assert.equal(datos.items.alergias, 'No');
  assert.equal(datos.habitos.tabaco, 'No');
  assert.equal(datos.habitos.exfumador, null);
  assert.equal(datos.detalles.diabetes, '');
  assert.equal(countRefiere(datos), 0);
  assert.equal(ITEM_KEYS.length, new Set(ITEM_KEYS).size);
  assert.ok(DETAIL_KEYS.every((key) => ITEM_KEYS.includes(key)));
});

test('conserva lo escrito y completa lo que falte o no sea texto', () => {
  const parsed = parseAntecedentesPersonales({
    items: { alergicos: ' PENICILINA, PARACETAMOL ', cancer: 42 },
    detalles: { diabetes: 'Tipo 2 desde 2019' },
    habitos: { exfumador: 'SI', aniosFumando: 10, cigarrillosDia: 'x' },
  });
  assert.equal(parsed.items.alergicos, 'PENICILINA, PARACETAMOL');
  assert.equal(parsed.items.cancer, 'NO REFIERE');
  assert.equal(parsed.detalles.diabetes, 'Tipo 2 desde 2019');
  assert.equal(parsed.habitos.exfumador, 'SI');
  assert.equal(parsed.habitos.aniosFumando, 10);
  assert.equal(parsed.habitos.cigarrillosDia, null);
});

test('solo cuenta como referido lo que no está vacío, NO REFIERE o No', () => {
  assert.equal(refiere('NO REFIERE'), false);
  assert.equal(refiere(' no '), false);
  assert.equal(refiere(''), false);
  assert.equal(refiere('Apendicectomía 2010'), true);
});

test('años fumando y cigarrillos solo se conservan si fuma o es exfumador', () => {
  const noFuma = parseAntecedentesPersonales({ habitos: { tabaco: 'No', exfumador: 'NO', aniosFumando: 5, cigarrillosDia: 10 } });
  assert.equal(esFumador(noFuma.habitos), false);
  assert.equal(noFuma.habitos.aniosFumando, null);
  assert.equal(noFuma.habitos.cigarrillosDia, null);
  const fuma = parseAntecedentesPersonales({ habitos: { tabaco: '5 al día', aniosFumando: 5, cigarrillosDia: 5 } });
  assert.equal(esFumador(fuma.habitos), true);
  assert.equal(fuma.habitos.aniosFumando, 5);
});

test('calcula el índice paquetes/año', () => {
  assert.equal(indicePaquetesAnio(10, 20), 10);
  assert.equal(indicePaquetesAnio(15, 3), 2.3);
  assert.equal(indicePaquetesAnio(null, 3), null);
});
