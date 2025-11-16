// src/components/dictamen/types.ts

// Para el filtro (plural)
export type EstadoDictamenFiltro =
  | 'PENDIENTES'
  | 'REABIERTOS'
  | 'CERRADOS'
  | 'TODOS';

// Para cada fila (estado real del dictamen)
export type EstadoDictamenRow = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

export interface DictamenRow {
  id: number;
  fechaDictamen: string | Date | null;
  docenteTipoDocumento: string;
  docenteDocumento: string;
  docenteNombre: string;
  estado: EstadoDictamenRow;
  reabierto?: boolean;
  medicoNombre: string | null;
}
