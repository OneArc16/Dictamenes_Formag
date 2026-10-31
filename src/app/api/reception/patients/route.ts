import { auditReception } from '@/features/reception/application/reception-audit';
import { executeIdempotent } from '@/features/reception/application/appointment-idempotency';
import { createPatientInTransaction, getPatient } from '@/features/reception/application/reception-service';
import { createPatientSchema } from '@/features/reception/domain/schemas';
import { idempotencyKey, receptionAuth, receptionBody, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

/** Registra un docente que no existe, para poder agendarle cita desde recepción. */
export async function POST(request: Request) {
  const auth = await receptionAuth(request, 'reception.patient.update');
  if (!auth.ok) return auth.response;
  try {
    const input = await receptionBody(request, createPatientSchema);
    const operation = await executeIdempotent({
      actorEmpleadoId: auth.auth.empleadoId,
      operationType: 'PATIENT_CREATE',
      idempotencyKey: idempotencyKey(request),
      payload: input,
      execute: (tx) => createPatientInTransaction(tx, input, auth.auth.name),
    });
    const patient = operation.replayed ? await getPatient(operation.value.id) : operation.value;
    await auditReception({
      requestId: receptionRequestId(request),
      actorEmpleadoId: auth.auth.empleadoId,
      action: 'PATIENT_CREATED',
      result: 'SUCCESS',
      resourceType: 'Usuario',
      resourceId: patient.id,
      httpStatus: 201,
    });
    return receptionJson(request, patient, 201);
  } catch (error) {
    return receptionError(request, error);
  }
}
