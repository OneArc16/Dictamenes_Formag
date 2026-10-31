import {
  ANTECEDENTE_KINDS,
  saveAntecedentes,
  type AntecedenteKind,
} from '@/features/atenciones/application/antecedentes';
import { saveAntecedentesSchema } from '@/features/atenciones/domain/antecedentes-personales';
import { ReceptionError } from '@/features/reception/application/errors';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import {
  assertReceptionRequestIntegrity,
  positiveQuery,
  receptionError,
  receptionJson,
} from '@/lib/http/with-reception-api';

export const runtime = 'nodejs';

/** Guarda los antecedentes personales o familiares del docente desde una atención en curso. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string; tipo: string }> }) {
  try {
    assertReceptionRequestIntegrity(request);
    const auth = await requireMedicoApi('appointment.attend');
    if (!auth.ok) {
      throw new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status);
    }
    const { id, tipo } = await params;
    if (!ANTECEDENTE_KINDS.includes(tipo as AntecedenteKind)) {
      throw new ReceptionError('NOT_FOUND', 'Tipo de antecedentes no válido.', 404);
    }
    const citaId = positiveQuery(id, 'Cita');
    const parsed = saveAntecedentesSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ReceptionError('VALIDATION_ERROR', 'Revisa los datos ingresados.', 422);
    return receptionJson(
      request,
      await saveAntecedentes(auth.auth, tipo as AntecedenteKind, citaId, parsed.data.expectedVersion, parsed.data.datos),
    );
  } catch (error) {
    return receptionError(request, error);
  }
}
