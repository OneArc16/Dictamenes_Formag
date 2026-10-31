import { deleteRemision } from '@/features/atenciones/application/remisiones';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Quita una remisión de la atención en curso. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; remisionId: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const { id, remisionId } = await params;
    return receptionJson(
      request,
      await deleteRemision(auth.auth, positiveQuery(id, 'Cita'), positiveQuery(remisionId, 'Remisión')),
    );
  } catch (error) {
    return receptionError(request, error);
  }
}
