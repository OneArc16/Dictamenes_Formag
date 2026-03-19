export type RecomendacionEstado = 'BORRADOR' | 'CERRADA' | 'ANULADA';

export type RecomendacionDetalleExamen = {
  id: number;
  nombre: string;
  resultado: string | null;
  observacion: string | null;
  fechaExamen: string | null;
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
  concepto: string;
  recomendacionesObservaciones: string;
  restriccionesLaborales: string;
  examenes: RecomendacionDetalleExamen[];
};
