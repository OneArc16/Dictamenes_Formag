import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseDatosRegistro, type DatosRegistro } from './datos-registro';

const datos: DatosRegistro = {
  version: 1,
  paciente: {
    nombreCompleto: 'DANIEL CASTAÑO',
    tipoDocumento: 'CC',
    documento: '1004462425',
    fechaNacimiento: '2002-10-13',
    edad: 24,
    sexo: 'H',
    estadoCivil: 'UNIÓN LIBRE',
    direccion: 'cll 3 10 43',
    telefono: '3022741098',
    eps: 'FIDUPREVISORA',
    cargo: 'Docente',
    secretaria: null,
    institucion: null,
    etnia: null,
    zonaResidencia: 'U',
  },
  profesional: {
    nombre: 'CLAUDIA YEJAS',
    tipoDocumento: 'CC',
    documento: '26881441',
    registroMedico: '8369',
    licencia: 'LIC. SST RES 065-202',
    firmaSrc: 'data:image/png;base64,AAAA',
  },
  sede: { codigoHabilitacion: '4700100001-01', direccion: 'Cra 19', telefono: '605', ciudad: 'SANTA MARTA' },
};

test('lee la copia guardada al finalizar tal como se escribió', () => {
  assert.deepEqual(parseDatosRegistro(JSON.parse(JSON.stringify(datos))), datos);
});

test('sin copia o con una copia inválida no hay datos de registro: se usan los actuales', () => {
  assert.equal(parseDatosRegistro(null), null);
  assert.equal(parseDatosRegistro({ version: 1, paciente: { nombreCompleto: 'X' } }), null);
  assert.equal(parseDatosRegistro('texto'), null);
});
