import { rescheduleAppointment } from '@/features/reception/application/reception-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { executeIdempotent } from '@/features/reception/application/appointment-idempotency';
import { rescheduleSchema } from '@/features/reception/domain/schemas';
import { idempotencyKey, positiveQuery, receptionAuth, receptionBody, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request, 'appointment.reschedule'); if (!auth.ok) return auth.response;
  try { const appointmentId = positiveQuery((await params).id, 'Cita'); const input = await receptionBody(request, rescheduleSchema); const operation = await executeIdempotent({ actorEmpleadoId: auth.auth.empleadoId, operationType: 'APPOINTMENT_RESCHEDULE', idempotencyKey: idempotencyKey(request), payload: { appointmentId, ...input }, execute: () => rescheduleAppointment(auth.auth, appointmentId, input.expectedVersion, input.newSlotId, input.reasonCode) }); await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'APPOINTMENT_RESCHEDULED', result: 'SUCCESS', resourceType: 'Cita', resourceId: operation.value.id, reasonCode: input.reasonCode, httpStatus: 200, metadata: { originalAppointmentId: appointmentId } }); return receptionJson(request, { ...operation.value, replayed: operation.replayed }); } catch (error) { return receptionError(request, error); }
}
