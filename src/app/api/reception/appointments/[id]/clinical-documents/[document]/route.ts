import { renderClinicalDocument, type ClinicalDocumentKind } from '@/features/reception/application/clinical-document-service';
import { ReceptionError } from '@/features/reception/application/errors';
import { receptionAuth, receptionError, positiveQuery } from '@/lib/http/with-reception-api';

const DOCUMENTS = new Set<ClinicalDocumentKind>(['hc', 'incapacidad', 'remision']);

export async function GET(request: Request, { params }: { params: Promise<{ id: string; document: string }> }) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const values = await params;
    const appointmentId = positiveQuery(values.id, 'Cita');
    if (!DOCUMENTS.has(values.document as ClinicalDocumentKind)) {
      throw new ReceptionError('CLINICAL_DOCUMENT_UNAVAILABLE', 'El documento clínico solicitado no está disponible.', 404);
    }
    const kind = values.document as ClinicalDocumentKind;
    const bytes = await renderClinicalDocument(auth.auth, appointmentId, kind);
    const filename = kind === 'hc' ? 'historia-clinica.pdf' : kind === 'incapacidad' ? 'incapacidades.pdf' : 'remisiones.pdf';
    return new Response(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'Content-Security-Policy': "frame-ancestors 'none'",
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    return receptionError(request, error);
  }
}
