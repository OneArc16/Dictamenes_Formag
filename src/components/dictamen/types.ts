// src/components/dictamen/types.ts

export type EstadoDictamenFiltro = 'PENDIENTES' | 'CERRADOS' | 'TODOS';

export interface DictamenRow {
  id: number;
  numeroDictamen: number | null;
  fechaDictamen: string | Date;
  estado: 'PENDIENTE' | 'CERRADO';
  reabierto: boolean;
  docenteDocumento: string;
  docenteNombre: string;
  medicoNombre: string | null;
  procedimientoPcl: 'A' | 'B';
  totalTitulo1: string | number | null;
  totalTitulo3: string | number | null;
}
