'use client';

export type EstadoRecomendacionFiltro =
  | 'PENDIENTES'
  | 'REABIERTAS'
  | 'CERRADAS'
  | 'ANULADAS'
  | 'TODOS';

export interface RecomendacionRow {
  id: number;
  fechaRecomendacion: string | Date | null;
  docenteDocumento?: string | null;
  docenteNombre?: string | null;
  secretaria?: string | null;
  estado?: 'PENDIENTE' | 'REABIERTO' | 'CERRADA' | 'ANULADA' | string;
  medicoNombre?: string | null;
  fueReabierta?: boolean;
  reabiertaEn?: string | Date | null;
  reabiertaPorNombre?: string | null;
  motivoReapertura?: string | null;
}
