import assert from 'node:assert/strict';
import test from 'node:test';

import { patientProfileSchema } from './schemas';

const validProfile = {
  expectedProfileVersion: 2,
  documentType: 'cc',
  documentNumber: '1004462425',
  firstName: 'Daniel',
  middleName: null,
  lastName: 'Castaño',
  secondLastName: null,
  birthDate: '2002-10-12',
  sex: 'M',
  epsCode: 'EPS001',
  municipalityCode: '47001',
  celular: '3022741098',
  telefono: null,
  email: null,
  direccion: 'Calle 3 # 10 - 43',
};

test('normaliza y acepta un perfil administrativo válido', () => {
  const parsed = patientProfileSchema.parse(validProfile);
  assert.equal(parsed.documentType, 'CC');
  assert.equal(parsed.documentNumber, '1004462425');
});

test('rechaza fechas futuras y campos no declarados', () => {
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, birthDate: '2999-01-01' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, unexpected: 'value' }).success, false);
});

test('exige nombres, sexo, EPS y un correo válido cuando se informa', () => {
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, firstName: '' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, sex: '' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, epsCode: '' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, email: 'correo-invalido' }).success, false);
});
