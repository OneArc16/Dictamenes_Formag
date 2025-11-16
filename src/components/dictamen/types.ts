export type EstadoDictamenFiltro =
  | 'PENDIENTES'
  | 'REABIERTOS'
  | 'CERRADOS'
  | 'TODOS';

export type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

export type DictamenRow = {
  id: number;
  fechaDictamen: string | Date;
  docenteTipoDocumento?: string;
  docenteDocumento?: string;
  docenteNombre?: string;
  estado: DictamenEstado;
  medicoNombre?: string | null;
  // si ya tienes otros campos, déjalos igual
};
