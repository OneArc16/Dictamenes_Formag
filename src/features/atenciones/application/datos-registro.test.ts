import assert from 'node:assert/strict';
import { test } from 'node:test';

import { toDatosRegistro, type CitaRegistro } from './datos-registro';

const cita: CitaRegistro = {
  paciente: {
    primerNombre: 'DANIEL',
    segundoNombre: 'ANDRES',
    primerApellido: 'CASTAÑO',
    segundoApellido: null,
    tipoIdentificacion: 'CC',
    identificacion: '1004462425',
    fechaNacimiento: new Date('2002-10-13T00:00:00.000Z'),
    edad: 24,
    sexo: 'H',
    estadoCivil: 'UNIÓN LIBRE',
    direccion: 'cll 3 10 43',
    celular: null,
    telefono: '3022741098',
    etnia: null,
    zonaResidencia: 'U',
    eps: { nombreEntidad: 'FIDUPREVISORA' },
    cargoDocente: { nombre: 'Docente' },
    secretariaRef: null,
    institucionEducativaRef: { nombre: 'IE Uno', secretaria: { nombre: 'Magdalena' } },
  },
  medico: {
    tipoDocumento: 'CC',
    numeroIdentidad: '26881441',
    primerNombre: 'CLAUDIA',
    segundoNombre: null,
    primerApellido: 'YEJAS',
    segundoApellido: 'OROZCO',
    registroMedico: '8369',
    licencia: 'LIC. SST',
    firma: Uint8Array.from([0xff, 0xd8, 0x01]),
    firmaMime: null,
  },
  sede: {
    codigoHabilitacion: null,
    direccion: 'Cra 19',
    telefono: null,
    municipio: null,
    centroMedico: { codigoHabilitacion: '4700100001-01', direccion: 'Otra', telefono: '605', municipio: { nombre: 'SANTA MARTA' } },
  },
};

test('arma la copia con los datos actuales del paciente, del médico y de la sede', () => {
  const datos = toDatosRegistro(cita);
  assert.deepEqual(datos.paciente, {
    nombreCompleto: 'DANIEL ANDRES CASTAÑO',
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
    secretaria: 'Magdalena',
    institucion: 'IE Uno',
    etnia: null,
    zonaResidencia: 'U',
  });
  assert.equal(datos.profesional.nombre, 'CLAUDIA YEJAS OROZCO');
  assert.equal(datos.profesional.licencia, 'LIC. SST');
  assert.equal(datos.profesional.firmaSrc, 'data:image/jpeg;base64,/9gB');
  // La sede manda; lo que le falte sale del centro médico.
  assert.deepEqual(datos.sede, { codigoHabilitacion: '4700100001-01', direccion: 'Cra 19', telefono: '605', ciudad: 'SANTA MARTA' });
});

test('los nombres se arman como antes: el del médico solo recorta cada parte, el del paciente junta espacios', () => {
  const datos = toDatosRegistro({
    ...cita,
    paciente: { ...cita.paciente, primerNombre: 'DANIEL  ANDRES', segundoNombre: null },
    medico: { ...cita.medico, primerNombre: ' MARIA  JOSE ' },
  });
  assert.equal(datos.paciente.nombreCompleto, 'DANIEL ANDRES CASTAÑO');
  assert.equal(datos.profesional.nombre, 'MARIA  JOSE YEJAS OROZCO');
});
