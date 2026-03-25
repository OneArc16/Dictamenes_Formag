import type {
  RecomendacionHistorialCambio,
  RecomendacionHistorialCampo,
} from '@/lib/recomendaciones/historial';

export type RecomendacionEstado = 'BORRADOR' | 'REABIERTO' | 'CERRADA' | 'ANULADA';

export type RecomendacionMotivoReaperturaOption = {
  id: number;
  nombre: string;
  descripcion: string | null;
};

export type RecomendacionHistorialTipo = 'REAPERTURA' | 'EDICION' | 'CIERRE';

export type { RecomendacionHistorialCambio, RecomendacionHistorialCampo };

export type RecomendacionHistorialItem = {
  id: number;
  tipo: RecomendacionHistorialTipo;
  fecha: string;
  actorNombre: string;
  estadoAnterior: RecomendacionEstado | null;
  estadoNuevo: RecomendacionEstado | null;
  motivoReapertura: string | null;
  cambios: RecomendacionHistorialCambio[];
};

export type RecomendacionDetalleViewModel = {
  id: number;
  numeroReferencia: string | null;
  fechaAtencion: string;
  estado: RecomendacionEstado;
  docente: {
    nombreCompleto: string;
    tipoDocumento: string;
    numeroDocumento: string;
    estadoCivil: string | null;
    edad: string | null;
    direccion: string | null;
    telefono: string | null;
    aseguradora: string | null;
    cargo: string | null;
    secretaria: string | null;
    institucion: string | null;
  };
  medicoResponsable: string;
  datosAtencion: {
    talla: string | null;
    peso: string | null;
    imc: string | null;
  };
  examenesRealizados: string;
  motivo: string;
  recomendacionesObservacionesRestricciones: string;
  historial: RecomendacionHistorialItem[];
};
