export type EstadoDictamenFiltro =
  | 'PENDIENTES'
  | 'REABIERTOS'
  | 'CERRADOS'
  | 'TODOS';

export type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';
export type DictamenHistorialTipo = 'REAPERTURA' | 'EDICION' | 'CIERRE';

export type DictamenDiagnosticoDTO = {
  cie10Codigo: string;
  tipo: 'CONFIRMADO_NUEVO' | 'IMPRESION_DIAGNOSTICA' | 'CONFIRMADO_REPETIDO';
  cie10Label?: string | null;
};

export type DictamenHistorialCambio = {
  campo: string;
  etiqueta: string;
  anterior: string | null;
  nuevo: string | null;
};

export type DictamenHistorialItem = {
  id: number;
  tipo: DictamenHistorialTipo;
  createdAt: string;
  actorNombre: string;
  estadoAnterior: DictamenEstado | null;
  estadoNuevo: DictamenEstado | null;
  motivoReapertura: string | null;
  cambios: DictamenHistorialCambio[];
};

export type DictamenUltimaReapertura = {
  createdAt: string;
  actorNombre: string;
  motivoReapertura: string | null;
};

export type DictamenDetalle = {
  id: number;
  numeroDictamen: string | null;
  fechaDictamen: string | null;
  procedimientoPcl: 'A' | 'B';
  estado: DictamenEstado;
  locked?: boolean;
  antecedentesClinicos: string | null;
  condicionSalud: string | null;
  descripcionHallazgos: string | null;
  sustentacionObservaciones: string | null;
  diagnosticos: DictamenDiagnosticoDTO[];
  fechaEstructuracionInvalidez?: string | null;
  tipoEvento?: 'ENFERMEDAD' | 'ACCIDENTE' | null;
  origenEvento?: 'LABORAL' | 'COMUN' | null;
  docente: {
    id: number;
    documento: string;
    tipoDocumento: string;
    nombreCompleto: string;
    edad: number | null;
    sexo: string;
    secretaria: string | null;
    institucion: string | null;
    tipoDictamen?: string | null;
  };
  medico: {
    id: number;
    nombreCompleto: string;
  } | null;
  historial: DictamenHistorialItem[];
  ultimaReapertura: DictamenUltimaReapertura | null;
};

export interface DictamenRow {
  id: number;
  fechaDictamen: string | Date | null;
  docenteDocumento?: string | null;
  docenteNombre?: string | null;
  secretaria?: string | null;
  estado?: DictamenEstado | string;
  medicoNombre?: string | null;
  fueReabierto?: boolean;
  reabiertaEn?: string | Date | null;
  reabiertaPorNombre?: string | null;
  motivoReapertura?: string | null;
  etapa?: 'FORMULARIO_ORIGEN' | 'DICTAMEN_PCL' | 'FLUJO_ANTERIOR' | string;
  actionRoute?: string;
  pclRoute?: string;
  originRoute?: string | null;
  canOpenPcl?: boolean;
  pclBloqueado?: boolean;
  canReopen?: boolean;
}



