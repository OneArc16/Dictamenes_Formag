import { saveAtencion } from '@/features/atenciones/application/attend-appointment';
import { saveAtencionSchema } from '@/features/atenciones/domain/atencion-form';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Guarda los campos de una pestaña de la atención mientras el paciente está activado. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const appointmentId = positiveQuery((await params).id, 'Cita');
    const parsed = saveAtencionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ReceptionError('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Revisa los datos ingresados.', 422);
    }
    return receptionJson(request, await saveAtencion(auth.auth, appointmentId, parsed.data));
  } catch (error) {
    return receptionError(request, error);
  }
}
