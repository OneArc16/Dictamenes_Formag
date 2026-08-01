import { renderReminderDocument } from '@/features/reception/application/reminder-document-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { positiveQuery, receptionAuth, receptionError, receptionRequestId } from '@/lib/http/with-reception-api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const auth = await receptionAuth(request, 'appointment.reminder.print');
  if (!auth.ok) return auth.response;
  try {
    const values = await params;
    const appointmentId = positiveQuery(values.id, 'Cita');
    const bytes = await renderReminderDocument(auth.auth, appointmentId, values.documentId);
    await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'REMINDER_RENDERED', result: 'SUCCESS', resourceType: 'DocumentoCita', resourceId: values.documentId, httpStatus: 200 });
    return new Response(bytes, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="recordatorio-cita.pdf"', 'Cache-Control': 'private, no-store', 'Content-Security-Policy': "frame-ancestors 'none'", 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cross-Origin-Resource-Policy': 'same-origin', 'X-Frame-Options': 'DENY' } });
  } catch (error) { return receptionError(request, error); }
}
