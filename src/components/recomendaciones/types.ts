'use client';

export type EstadoRecomendacionFiltro =
  | 'PENDIENTES'
  | 'CERRADAS'
  | 'ANULADAS'
  | 'TODOS';

export interface RecomendacionRow {
  id: number;
  fechaRecomendacion: string | Date | null;
  docenteDocumento?: string | null;
  docenteNombre?: string | null;
  secretaria?: string | null;
  estado?: 'PENDIENTE' | 'CERRADA' | 'ANULADA' | string;
  medicoNombre?: string | null;
}