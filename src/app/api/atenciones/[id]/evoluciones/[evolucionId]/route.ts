import { deleteEvolucion } from '@/features/atenciones/application/evoluciones';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Quita una evolución de la atención en curso. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; evolucionId: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const { id, evolucionId } = await params;
    return receptionJson(
      request,
      await deleteEvolucion(auth.auth, positiveQuery(id, 'Cita'), positiveQuery(evolucionId, 'Evolución')),
    );
  } catch (error) {
    return receptionError(request, error);
  }
}
