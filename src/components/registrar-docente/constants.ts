import type { DocenteForm, RequiredField } from './types';

export const STORAGE_KEY = 'dictamy_registro_docente';

export const emptyForm: DocenteForm = {
  tipoDocumento: '',
  numeroDocumento: '',
  fechaNacimiento: '',
  edad: '',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  sexo: '',
  direccion: '',
  barrio: '',
  departamento: '',
  municipio: '',
  zona: '',
  telefono: '',
  pais: 'COLOMBIA',
  codigoEps: '',
  categoria: '',
  secretariaLabora: '',
  formaVinculacion: '',
  estadoCivil: '',
  gradoEscalafon: '',
  nivelEscalafon: '',
  institucionLabora: '',
  cargoDocenteId: null,
  cargoDocenteNombre: '',
  escolaridad: '',
  tipoDictamen: 'CALIFICACION',
  fechaVinculacion: '',
};

export const REQUIRED_FIELDS: RequiredField[] = [
  { key: 'tipoDocumento', label: 'Tipo de documento' },
  { key: 'numeroDocumento', label: 'Numero de documento' },
  { key: 'primerNombre', label: 'Primer nombre' },
  { key: 'primerApellido', label: 'Primer apellido' },
  { key: 'fechaNacimiento', label: 'Fecha de nacimiento' },
];

export const TIPO_DOCUMENTO_OPTIONS = [
  { value: 'CC', label: 'Cedula de ciudadania (CC)' },
  { value: 'TI', label: 'Tarjeta de identidad (TI)' },
  { value: 'CE', label: 'Cedula de extranjeria (CE)' },
  { value: 'PA', label: 'Pasaporte (PA)' },
];

export const SEXO_OPTIONS = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
  { value: 'O', label: 'Otro' },
];

export const ZONA_OPTIONS = [
  { value: 'URBANA', label: 'Urbana' },
  { value: 'RURAL', label: 'Rural' },
];

export const CATEGORIA_OPTIONS = [
  { value: 'CONTRIBUTIVO', label: 'Contributivo' },
  { value: 'ESPECIAL', label: 'Especial' },
];

export const ESCOLARIDAD_OPTIONS = [
  { value: 'PRIMARIA', label: 'PRIMARIA' },
  { value: 'SECUNDARIA', label: 'SECUNDARIA' },
  { value: 'TÉCNICO', label: 'TÉCNICO' },
  { value: 'TECNÓLOGO', label: 'TECNÓLOGO' },
  { value: 'PROFESIONAL', label: 'PROFESIONAL' },
  { value: 'ESPECIALIZACIÓN', label: 'ESPECIALIZACIÓN' },
  { value: 'MAESTRÍA', label: 'MAESTRÍA' },
  { value: 'DOCTORADO', label: 'DOCTORADO' },
  { value: 'OTRO', label: 'OTRO' },
];

export const TIPO_DICTAMEN_OPTIONS = [
  { value: 'CALIFICACION', label: 'Calificacion' },
  { value: 'RECALIFICACION', label: 'Recalificacion' },
];

export const FORMA_VINCULACION_OPTIONS = [
  { value: 'PROPIEDAD', label: 'Propiedad' },
  { value: 'PROVISIONALIDAD', label: 'Provisionalidad' },
];

export const ESTADO_CIVIL_OPTIONS = [
  { value: 'SOLTERO(A)', label: 'Soltero(a)' },
  { value: 'CASADO(A)', label: 'Casado(a)' },
  { value: 'UNIÓN LIBRE', label: 'Unión libre' },
  { value: 'SEPARADO(A)', label: 'Separado(a)' },
  { value: 'VIUDO(A)', label: 'Viudo(a)' },
];

export const NIVEL_ESCALAFON_OPTIONS = [
  { value: 'NO_APLICA', label: 'No aplica' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
];
