import { deleteIncapacidad } from '@/features/atenciones/application/incapacidades';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Quita una incapacidad de la atención en curso. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; incapacidadId: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const { id, incapacidadId } = await params;
    return receptionJson(
      request,
      await deleteIncapacidad(auth.auth, positiveQuery(id, 'Cita'), positiveQuery(incapacidadId, 'Incapacidad')),
    );
  } catch (error) {
    return receptionError(request, error);
  }
}
