import { getPatient, updatePatientContact } from '@/features/reception/application/reception-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { executeIdempotent } from '@/features/reception/application/appointment-idempotency';
import { patientContactSchema } from '@/features/reception/domain/schemas';
import { idempotencyKey, positiveQuery, receptionAuth, receptionBody, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request, 'reception.patient.update');
  if (!auth.ok) return auth.response;
  try { const patientId = positiveQuery((await params).id, 'Paciente'); const input = await receptionBody(request, patientContactSchema); const operation = await executeIdempotent({ actorEmpleadoId: auth.auth.empleadoId, operationType: 'PATIENT_CONTACT_UPDATE', idempotencyKey: idempotencyKey(request), payload: { patientId, ...input }, execute: () => updatePatientContact(patientId, input) }); const patient = operation.replayed ? await getPatient(patientId) : operation.value; await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'PATIENT_CONTACT_UPDATED', result: 'SUCCESS', resourceType: 'Usuario', resourceId: patientId, httpStatus: 200 }); return receptionJson(request, patient); } catch (error) { return receptionError(request, error); }
}
