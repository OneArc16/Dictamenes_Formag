import { createEvolucion } from '@/features/atenciones/application/evoluciones';
import { createEvolucionSchema } from '@/features/atenciones/domain/evoluciones';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Agrega una evolución a la atención en curso. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const citaId = positiveQuery((await params).id, 'Cita');
    const parsed = createEvolucionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ReceptionError('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Revisa la evolución.', 422);
    }
    return receptionJson(request, await createEvolucion(auth.auth, citaId, parsed.data), 201);
  } catch (error) {
    return receptionError(request, error);
  }
}
