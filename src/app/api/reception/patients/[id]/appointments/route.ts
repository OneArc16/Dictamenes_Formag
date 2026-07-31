import type { EstadoCita } from '@prisma/client';
import { appointmentHistory } from '@/features/reception/application/reception-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { positiveQuery, receptionAuth, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

const states = new Set<EstadoCita>(['ASIGNADA', 'ATENDIDA', 'REPROGRAMADA', 'CANCELADA']);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request); if (!auth.ok) return auth.response;
  try {
    const selected = (new URL(request.url).searchParams.get('states') ?? '').split(',').filter((state): state is EstadoCita => states.has(state as EstadoCita));
    const patientId = positiveQuery((await params).id, 'Paciente');
    const items = await appointmentHistory(patientId, selected);
    await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'APPOINTMENT_HISTORY_VIEWED', result: 'SUCCESS', resourceType: 'Usuario', resourceId: patientId, httpStatus: 200, metadata: { filtered: selected.length > 0 } });
    return receptionJson(request, items);
  } catch (error) { return receptionError(request, error); }
}
