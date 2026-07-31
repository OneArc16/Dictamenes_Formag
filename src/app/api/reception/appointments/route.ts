import { scheduleAppointment } from '@/features/reception/application/reception-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { executeIdempotent } from '@/features/reception/application/appointment-idempotency';
import { appointmentSchema } from '@/features/reception/domain/schemas';
import { idempotencyKey, receptionAuth, receptionBody, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

export async function POST(request: Request) {
  const auth = await receptionAuth(request, 'appointment.schedule');
  if (!auth.ok) return auth.response;
  try {
    const input = await receptionBody(request, appointmentSchema);
    const operation = await executeIdempotent({ actorEmpleadoId: auth.auth.empleadoId, operationType: 'APPOINTMENT_SCHEDULE', idempotencyKey: idempotencyKey(request), payload: input, execute: () => scheduleAppointment(auth.auth, input) });
    await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'APPOINTMENT_CREATED', result: 'SUCCESS', resourceType: 'Cita', resourceId: operation.value.id, httpStatus: operation.replayed ? 200 : 201 });
    return receptionJson(request, { id: operation.value.id, lockVersion: operation.value.lockVersion, replayed: operation.replayed }, operation.replayed ? 200 : 201);
  } catch (error) { return receptionError(request, error); }
}
