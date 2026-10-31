import { saveRevisionSistemas } from '@/features/atenciones/application/revision-sistemas';
import { saveRevisionSistemasSchema } from '@/features/atenciones/domain/revision-sistemas';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Guarda la revisión por sistemas de una atención en curso. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const citaId = positiveQuery((await params).id, 'Cita');
    const parsed = saveRevisionSistemasSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ReceptionError('VALIDATION_ERROR', 'Revisa la revisión por sistemas.', 422);
    return receptionJson(request, await saveRevisionSistemas(auth.auth, citaId, parsed.data.datos));
  } catch (error) {
    return receptionError(request, error);
  }
}
