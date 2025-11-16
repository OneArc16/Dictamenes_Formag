export type EstadoDictamenFiltro =
  | 'PENDIENTES'
  | 'REABIERTOS'
  | 'CERRADOS'
  | 'TODOS';

export interface DictamenRow {
  id: number;
  fechaDictamen: string | Date | null;
  docenteDocumento?: string | null;
  docenteNombre?: string | null;
  secretaria?: string | null;
  estado?: 'PENDIENTE' | 'REABIERTO' | 'CERRADO' | string;
  medicoNombre?: string | null;
}
