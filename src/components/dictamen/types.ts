// src/components/dictamen/types.ts

export type EstadoDictamenFiltro = 'PENDIENTES' | 'CERRADOS' | 'TODOS';

export interface DictamenRow {
  id: number;
  numeroDictamen: number | null;
  fechaDictamen: string | Date;
  estado: 'PENDIENTE' | 'CERRADO';
  reabierto: boolean;
  docenteTipoDocumento?: string; 
  docenteDocumento: string;
  docenteNombre: string;
  medicoNombre?: string | null;
}
