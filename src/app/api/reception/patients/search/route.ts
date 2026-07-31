import { searchPatient } from '@/features/reception/application/reception-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { consumePatientSearchQuota } from '@/features/reception/infrastructure/postgres-search-rate-limiter';
import { patientSearchSchema } from '@/features/reception/domain/schemas';
import { receptionAuth, receptionBody, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

export async function POST(request: Request) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const input = await receptionBody(request, patientSearchSchema);
    await consumePatientSearchQuota(auth.auth.empleadoId);
    const result = await searchPatient(input.documentNumber, input.documentType);
    const patientId = result.kind === 'result' ? result.patient?.id ?? null : null;
    await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'PATIENT_SEARCH', result: 'SUCCESS', resourceType: 'Usuario', resourceId: patientId, httpStatus: 200, metadata: { found: Boolean(patientId), ambiguous: result.kind === 'ambiguous' } });
    return receptionJson(request, result);
  } catch (error) { return receptionError(request, error); }
}
