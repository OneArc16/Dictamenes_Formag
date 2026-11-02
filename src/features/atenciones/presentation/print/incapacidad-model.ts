import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import { categoriaLabel } from '@/features/atenciones/domain/incapacidades';

import {
  buildEncabezadoClinico,
  clean,
  formatFecha,
  formatFechaHora,
  ordenDiagnostico,
  type DocumentoClinicoExtras,
} from './documento-clinico-model';

export type IncapacidadesDocumento = ReturnType<typeof buildIncapacidades>;

/** Las incapacidades de la atención, con el mismo encabezado de la historia clínica. */
export function buildIncapacidades(detalle: AtencionDetalle, extras: DocumentoClinicoExtras) {
  return {
    ...buildEncabezadoClinico(detalle, extras),
    incapacidades: detalle.incapacidades.map((item) => ({
      numero: item.numeroInterno,
      fecha: formatFechaHora(item.fecha),
      inicio: formatFecha(item.fechaInicio),
      fin: formatFecha(item.fechaFin),
      dias: `${item.dias} ${item.dias === 1 ? 'día' : 'días'}`,
      prorroga: item.prorroga ? 'Sí' : 'No',
      categoria: categoriaLabel(item.categoria),
      observaciones: clean(item.observaciones),
      diagnosticos: item.diagnosticos.map((diagnostico, index) => ({
        orden: ordenDiagnostico(index),
        codigo: diagnostico.codigo,
        nombre: diagnostico.nombre,
      })),
    })),
  };
}
