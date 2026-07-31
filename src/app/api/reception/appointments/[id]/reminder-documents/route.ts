import { createReminderDocument } from '@/features/reception/application/reminder-document-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { receptionAuth, receptionError, receptionJson, positiveQuery, receptionRequestId } from '@/lib/http/with-reception-api';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request, 'appointment.reminder.print');
  if (!auth.ok) return auth.response;
  try { const appointmentId = positiveQuery((await params).id, 'Cita'); const document = await createReminderDocument(auth.auth, appointmentId); await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'REMINDER_DOCUMENT_CREATED', result: 'SUCCESS', resourceType: 'DocumentoCita', resourceId: document.id, httpStatus: document.replayed ? 200 : 201 }); return receptionJson(request, document, document.replayed ? 200 : 201); } catch (error) { return receptionError(request, error); }
}
