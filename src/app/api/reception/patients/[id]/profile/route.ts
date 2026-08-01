import { auditReception } from '@/features/reception/application/reception-audit';
import { executeIdempotent } from '@/features/reception/application/appointment-idempotency';
import { getPatient, updatePatientProfileInTransaction } from '@/features/reception/application/reception-service';
import { patientProfileSchema } from '@/features/reception/domain/schemas';
import { idempotencyKey, positiveQuery, receptionAuth, receptionBody, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request, 'reception.patient.update');
  if (!auth.ok) return auth.response;
  try {
    const patientId = positiveQuery((await params).id, 'Paciente');
    const input = await receptionBody(request, patientProfileSchema);
    const operation = await executeIdempotent({
      actorEmpleadoId: auth.auth.empleadoId,
      operationType: 'PATIENT_PROFILE_UPDATE',
      idempotencyKey: idempotencyKey(request),
      payload: { patientId, ...input },
      execute: (tx) => updatePatientProfileInTransaction(tx, patientId, input),
    });
    const patient = operation.replayed ? await getPatient(patientId) : operation.value;
    await auditReception({
      requestId: receptionRequestId(request),
      actorEmpleadoId: auth.auth.empleadoId,
      action: 'PATIENT_PROFILE_UPDATED',
      result: 'SUCCESS',
      resourceType: 'Usuario',
      resourceId: patientId,
      httpStatus: 200,
    });
    return receptionJson(request, patient);
  } catch (error) {
    return receptionError(request, error);
  }
}
