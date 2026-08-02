import assert from 'node:assert/strict';
import test from 'node:test';

import { patientProfileSchema } from './schemas';
import { isFideicomisosEps, patientSexFromDatabase, patientSexToDatabase } from './patient-profile';
import { uniqueByNormalizedName } from './catalog-options';

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
  departmentCode: '47',
  municipalityCode: '47001',
  neighborhood: 'CENTRO',
  zone: 'U',
  countryCode: '057',
  category: 'ESPECIAL',
  celular: '3022741098',
  telefono: null,
  email: null,
  direccion: 'Calle 3 # 10 - 43',
  teacherPositionId: null,
  education: 'PROFESIONAL',
  employmentStartDate: null,
  secretariatId: null,
  institutionId: null,
  employmentType: 'PROPIEDAD',
  civilStatus: null,
  salaryGrade: '14',
  salaryLevel: 'A',
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

test('exige nombres, sexo, EPS, ubicación base y un correo válido cuando se informa', () => {
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, firstName: '' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, sex: '' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, epsCode: '' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, zone: '' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, countryCode: '' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, email: 'correo-invalido' }).success, false);
});

test('valida identificadores y campos laborales sin aceptar fechas futuras', () => {
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, teacherPositionId: 0 }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, employmentStartDate: '2999-01-01' }).success, false);
  assert.equal(patientProfileSchema.safeParse({ ...validProfile, salaryLevel: 'Z' }).success, false);
});

test('traduce el convenio histórico de sexo sin confundir mujer con masculino', () => {
  assert.equal(patientSexFromDatabase('H'), 'M');
  assert.equal(patientSexFromDatabase('M'), 'F');
  assert.equal(patientSexFromDatabase('F'), 'F');
  assert.equal(patientSexToDatabase('M'), 'H');
  assert.equal(patientSexToDatabase('F'), 'M');
});

test('identifica la EPS Fideicomisos aun con variantes de nombre', () => {
  assert.equal(isFideicomisosEps('FIDEICOMISOS PATRIMONIOS AUTÓNOMOS FIDUCIARIA LA PREVISORA S.A.'), true);
  assert.equal(isFideicomisosEps('Fiduprevisora'), true);
  assert.equal(isFideicomisosEps('Otra EPS'), false);
});

test('elimina instituciones repetidas por nombre normalizado conservando la primera', () => {
  const result = uniqueByNormalizedName([
    { id: 10, nombre: 'IED LICEO SAMARIO' },
    { id: 11, nombre: ' ied  liceo samario ' },
    { id: 12, nombre: 'Institución Educativa Distrital' },
    { id: 13, nombre: 'INSTITUCION EDUCATIVA DISTRITAL' },
  ]);

  assert.deepEqual(result.map((item) => item.id), [10, 12]);
});
