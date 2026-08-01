import { createReminderDocumentInTransaction } from '@/features/reception/application/reminder-document-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { executeIdempotent } from '@/features/reception/application/appointment-idempotency';
import { idempotencyKey, receptionAuth, receptionError, receptionJson, positiveQuery, receptionRequestId } from '@/lib/http/with-reception-api';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request, 'appointment.reminder.print');
  if (!auth.ok) return auth.response;
  try { const appointmentId = positiveQuery((await params).id, 'Cita'); const operation = await executeIdempotent({ actorEmpleadoId: auth.auth.empleadoId, operationType: 'REMINDER_DOCUMENT_CREATE', idempotencyKey: idempotencyKey(request), payload: { appointmentId }, execute: (tx) => createReminderDocumentInTransaction(tx, auth.auth, appointmentId), replayResourceId: (resourceId) => resourceId }); await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'REMINDER_DOCUMENT_CREATED', result: 'SUCCESS', resourceType: 'DocumentoCita', resourceId: operation.value.id, httpStatus: operation.replayed ? 200 : 201 }); return receptionJson(request, { id: operation.value.id, replayed: operation.replayed }, operation.replayed ? 200 : 201); } catch (error) { return receptionError(request, error); }
}
