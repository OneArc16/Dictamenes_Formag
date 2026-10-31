import { saveDiagnosticos } from '@/features/atenciones/application/diagnosticos';
import { saveDiagnosticosSchema } from '@/features/atenciones/domain/diagnosticos';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Guarda la lista de diagnósticos CIE10 de una atención en curso. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const citaId = positiveQuery((await params).id, 'Cita');
    const parsed = saveDiagnosticosSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ReceptionError('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Revisa los diagnósticos.', 422);
    }
    return receptionJson(request, await saveDiagnosticos(auth.auth, citaId, parsed.data.diagnosticos));
  } catch (error) {
    return receptionError(request, error);
  }
}
