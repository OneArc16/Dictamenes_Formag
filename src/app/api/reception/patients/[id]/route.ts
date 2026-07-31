import { getPatient } from '@/features/reception/application/reception-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { positiveQuery, receptionAuth, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;
  try { const patientId = positiveQuery((await params).id, 'Paciente'); const patient = await getPatient(patientId); await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'PATIENT_VIEWED', result: 'SUCCESS', resourceType: 'Usuario', resourceId: patientId, httpStatus: 200 }); return receptionJson(request, patient); } catch (error) { return receptionError(request, error); }
}
