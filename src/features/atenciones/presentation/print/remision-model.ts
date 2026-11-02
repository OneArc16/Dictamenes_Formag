import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import { tipoJuntaLabel } from '@/features/atenciones/domain/remisiones';

import {
  buildEncabezadoClinico,
  clean,
  formatFechaHora,
  ordenDiagnostico,
  type DocumentoClinicoExtras,
} from './documento-clinico-model';

export type RemisionesDocumento = ReturnType<typeof buildRemisiones>;

/** Las remisiones de la atención (o solo `remisionId`), con el mismo encabezado de la historia clínica. */
export function buildRemisiones(detalle: AtencionDetalle, extras: DocumentoClinicoExtras, remisionId?: number) {
  const remisiones =
    remisionId === undefined ? detalle.remisiones : detalle.remisiones.filter((item) => item.id === remisionId);

  return {
    ...buildEncabezadoClinico(detalle, extras),
    remisiones: remisiones.map((item) => ({
      numero: String(item.id),
      fecha: formatFechaHora(item.fecha),
      cupsCodigo: item.cups.codigo,
      cupsNombre: item.cups.nombre,
      junta: item.tipoDictamen ? tipoJuntaLabel(item.tipoDictamen) : null,
      motivo: clean(item.motivo),
      diagnosticos: item.diagnosticos.map((diagnostico, index) => ({
        orden: ordenDiagnostico(index),
        codigo: diagnostico.codigo,
        nombre: diagnostico.nombre,
      })),
    })),
  };
}
