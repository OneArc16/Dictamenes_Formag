export type PdfDictamenDataBasic = {
  dictamenNumero: string;
  fechaDictamen: string;

  ciudad: string;

  // checks en Aspectos Generales
  checkEnfermedadGeneral: boolean;
  checkAtep: boolean;
  checkDecreto1848: boolean;
  checkLey100: boolean;
  checkProcedimientoA: boolean;
  checkProcedimientoB: boolean;

  establecimientoEducativo: string;
  entidadTerritorial: string;
  fechaAspectos: string;

  nombres: string;
  apellidos: string;
  documento: string;

  genero: string;
  nivelEscolaridad: string;
  estadoCivil: string;

  fechaNacimiento: string;
  edad: string;

  direccion: string;

  zona: string;
  municipio: string;
  departamento: string;

  cargo: string;
  gradoEscalafon: string;
  formaVinculacion: string;

  // (si ya los usas abajo)
  diagnosticos?: { cie10: string; nombre: string }[];
  antecedentesClinicos?: string;
  condicionSalud?: string;
};
