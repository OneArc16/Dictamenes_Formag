export type DocenteForm = {
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  edad: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  sexo: string;
  direccion: string;
  barrio: string;
  departamento: string;
  municipio: string;
  zona: string;
  telefono: string;
  pais: string;
  codigoEps: string;
  categoria: string;
  secretariaLabora: string;
  formaVinculacion: string;
  estadoCivil: string;
  gradoEscalafon: string;
  nivelEscalafon: string;
  institucionLabora: string;
  cargoDocenteId: number | null;
  cargoDocenteNombre: string;
  escolaridad: string;
  tipoDictamen: 'CALIFICACION' | 'RECALIFICACION' | '';
  fechaVinculacion: string;
};

export type DocenteModalMode = 'DICTAMEN' | 'RECOMENDACION';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: DocenteModalMode;
  medicoResponsableId?: number | null;
  onDictamenCreated?: () => void;
  onDocenteSaved?: (usuarioId: number) => void;
};

export type ToastType = 'success' | 'error' | 'info';

export type PaisOption = { codigo: string; nombre: string };
export type DepartamentoOption = { codigo: string; nombre: string };
export type MunicipioOption = {
  codigo: string;
  nombre: string;
  codigoDepartamento: string;
};
export type BarrioOption = {
  id: number;
  nombre: string;
  codigoMunicipio: string;
};
export type EpsOption = { codigo: string; nombre: string };
export type SecretariaOption = { id: number; nombre: string };
export type InstitucionOption = {
  id: number;
  nombre: string;
  idDepartamento: string | null;
  idMunicipio: string | null;
  idSecretaria: number | null;
};
export type CargoDocenteOption = { id: number; codigo: string; nombre: string };

export type RequiredField = {
  key: keyof DocenteForm;
  label: string;
};
