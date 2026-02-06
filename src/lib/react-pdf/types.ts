// src/lib/pdf-react/types.ts
export type DictamenDTO = {
  id: number;

  docente?: {
    tipoId?: string;
    numeroId?: string;
    nombres?: string;
    apellidos?: string;
    fechaNacimiento?: string;
  };

  procedimientoPcl?: 'A' | 'B';

  // agrega lo que ya tienes en BD:
  tituloI?: any;
  tituloII?: any;
  tituloIII?: any;

  firmas?: {
    medicoNombre?: string;
    medicoRegistro?: string;
    fecha?: string;
  };
};