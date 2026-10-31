import { saveSignosVitales } from '@/features/atenciones/application/signos-vitales';
import { signosVitalesSchema } from '@/features/atenciones/domain/signos-vitales';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Guarda los signos vitales tomados en una atención en curso. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const citaId = positiveQuery((await params).id, 'Cita');
    const parsed = signosVitalesSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ReceptionError('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Revisa los signos vitales.', 422);
    }
    return receptionJson(request, await saveSignosVitales(auth.auth, citaId, parsed.data));
  } catch (error) {
    return receptionError(request, error);
  }
}
