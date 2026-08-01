import { activateAppointmentInTransaction } from '@/features/reception/application/reception-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { executeIdempotent } from '@/features/reception/application/appointment-idempotency';
import { appointmentActionSchema } from '@/features/reception/domain/schemas';
import { idempotencyKey, positiveQuery, receptionAuth, receptionBody, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request, 'appointment.activate'); if (!auth.ok) return auth.response;
  try { const appointmentId = positiveQuery((await params).id, 'Cita'); const input = await receptionBody(request, appointmentActionSchema); const operation = await executeIdempotent({ actorEmpleadoId: auth.auth.empleadoId, operationType: 'APPOINTMENT_ACTIVATE', idempotencyKey: idempotencyKey(request), payload: { appointmentId, ...input }, execute: (tx) => activateAppointmentInTransaction(tx, auth.auth, appointmentId, input.expectedVersion) }); await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'APPOINTMENT_ACTIVATED', result: 'SUCCESS', resourceType: 'Cita', resourceId: appointmentId, httpStatus: 200 }); return receptionJson(request, { ...operation.value, replayed: operation.replayed }); } catch (error) { return receptionError(request, error); }
}
