import type { AuthorizationContext } from '@/lib/auth/authorization';
import { getAtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import {
  renderHistoriaClinicaPdf,
  renderIncapacidadesPdf,
  renderRemisionesPdf,
} from '@/features/atenciones/application/documentos-clinicos-print';

import { ReceptionError } from './errors';
import { assertAttendedAppointmentSite } from './reception-service';

export type ClinicalDocumentKind = 'hc' | 'incapacidad' | 'remision';

export async function renderClinicalDocument(auth: AuthorizationContext, appointmentId: number, kind: ClinicalDocumentKind, remisionId?: number) {
  await assertAttendedAppointmentSite(auth, appointmentId);
  const detail = await getAtencionDetalle(auth, appointmentId);
  if (!detail || detail.estado !== 'ATENDIDA') {
    throw new ReceptionError('CLINICAL_DOCUMENT_NOT_RENDERABLE', 'La cita no permite imprimir documentos clínicos.', 409);
  }
  if (kind === 'hc') return renderHistoriaClinicaPdf(detail);
  if (kind === 'remision') {
    if (!detail.remisiones.some((item) => remisionId === undefined || item.id === remisionId)) {
      throw new ReceptionError('CLINICAL_DOCUMENT_UNAVAILABLE', 'La remisión solicitada no está disponible para imprimir.', 404);
    }
    return renderRemisionesPdf(detail, remisionId);
  }
  if (!detail.incapacidades.length) {
    throw new ReceptionError('CLINICAL_DOCUMENT_UNAVAILABLE', 'La cita no tiene incapacidades para imprimir.', 404);
  }
  return renderIncapacidadesPdf(detail);
}
