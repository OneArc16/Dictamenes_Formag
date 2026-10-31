import { attendAppointment } from '@/features/atenciones/application/attend-appointment';
import { ReceptionError } from '@/features/reception/application/errors';
import { auditReception } from '@/features/reception/application/reception-audit';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
  receptionRequestId,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const appointmentId = positiveQuery((await params).id, 'Cita');
    const result = await attendAppointment(auth.auth, appointmentId);
    await auditReception({
      requestId: receptionRequestId(request),
      actorEmpleadoId: auth.auth.empleadoId,
      action: 'APPOINTMENT_ATTENDED',
      result: 'SUCCESS',
      resourceType: 'Cita',
      resourceId: appointmentId,
      httpStatus: 200,
    });
    return receptionJson(request, result);
  } catch (error) {
    return receptionError(request, error);
  }
}
