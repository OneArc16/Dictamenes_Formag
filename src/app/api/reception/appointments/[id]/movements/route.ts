import { appointmentMovements } from '@/features/reception/application/reception-service';
import { auditReception } from '@/features/reception/application/reception-audit';
import { ReceptionError } from '@/features/reception/application/errors';
import { positiveQuery, receptionAuth, receptionError, receptionJson, receptionRequestId } from '@/lib/http/with-reception-api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await receptionAuth(request); if (!auth.ok) return auth.response;
  try {
    const query = new URL(request.url).searchParams;
    const pageSize = Number(query.get('pageSize') ?? 20);
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) throw new ReceptionError('VALIDATION_ERROR', 'El tamaño de página no es válido.', 422);
    const appointmentId = positiveQuery((await params).id, 'Cita');
    const page = await appointmentMovements(appointmentId, pageSize, query.get('cursor'));
    await auditReception({ requestId: receptionRequestId(request), actorEmpleadoId: auth.auth.empleadoId, action: 'APPOINTMENT_MOVEMENTS_VIEWED', result: 'SUCCESS', resourceType: 'Cita', resourceId: appointmentId, httpStatus: 200, metadata: { pageSize } });
    return receptionJson(request, page);
  } catch (error) { return receptionError(request, error); }
}
