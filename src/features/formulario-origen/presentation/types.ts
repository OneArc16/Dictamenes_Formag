export type OriginTab =
  | 'descripcion'
  | 'historial-laboral'
  | 'informacion-fundamentos'
  | 'diagnostico-tratamiento'
  | 'sustentacion';

export type ValidationIssue = {
  section: OriginTab;
  field: string;
  message: string;
};

export type HistorialLaboralRow = {
  id: number;
  institucionId: number | null;
  institucionNombreSnapshot: string;
  cargoId: number | null;
  cargoNombreSnapshot: string;
  riesgosLaborales: string;
  jornadaLaboral: string;
  tiempoExposicionAnios: number;
};

export type SoporteRow = {
  id: number;
  tipo:
    | 'REPORTE_ACCIDENTE_TRABAJO'
    | 'DESCRIPCION_EVENTO'
    | 'EPICRISIS_RESUMEN_HISTORIA'
    | 'CERTIFICADO_DEFUNCION'
    | 'ANALISIS_PUESTO_TRABAJO'
    | 'EXAMENES_PREOCUPACIONALES'
    | 'INVESTIGACION_ACCIDENTE'
    | 'OTRO';
  estado: 'APORTADO' | 'NO_APORTADO' | 'NO_APLICA';
  fechaDocumento: string | null;
  seTuvoEnCuenta: string | null;
  nombreOtro: string | null;
};

export type DiagnosticoRow = {
  id: number;
  cie10Codigo: string;
  cie10Label: string;
  tipo:
    | 'CONFIRMADO_NUEVO'
    | 'IMPRESION_DIAGNOSTICA'
    | 'CONFIRMADO_REPETIDO';
  esPrincipal: boolean;
};

export type FormularioOrigenDto = {
  id: number;
  dictamenId: number;
  estado: 'BORRADOR' | 'FINALIZADO' | 'REABIERTO';
  formatoVersion: string;
  versionActual: number;
  lockVersion: number;
  fechaDictamenOrigen: string;
  numeroDictamenOrigen: string | null;
  descripcion: string;
  actividadExtralaboral: string;
  fechaOcurrencia: string | null;
  horaOcurrencia: string | null;
  diaSemana: string | null;
  jornadaEvento: 'NORMAL' | 'EXTRA' | 'NO_DETERMINADA' | null;
  tratamiento: string;
  concepto: string;
  fundamentosDerecho: string;
  tipoEvento: 'ENFERMEDAD' | 'ACCIDENTE' | null;
  origenEvento: 'LABORAL' | 'COMUN' | null;
  finalizadoEn: string | null;
  updatedAt: string;
  readOnly: boolean;
  canFinalize: boolean;
  canOpenPcl: boolean;
  docente: {
    id: number;
    documento: string;
    tipoDocumento: string;
    nombreCompleto: string;
    edad: number | null;
    secretaria: string | null;
    institucion: string | null;
    tipoDictamen: string | null;
  };
  medico: { id: number; nombreCompleto: string } | null;
  historialLaboral: HistorialLaboralRow[];
  soportes: SoporteRow[];
  diagnosticos: DiagnosticoRow[];
  validation: {
    issues: ValidationIssue[];
    progress: {
      completed: number;
      total: number;
      incomplete: OriginTab[];
    };
  };
};
