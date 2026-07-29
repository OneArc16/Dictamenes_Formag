import { NextResponse } from 'next/server';

import { assertAgendaCreationScope } from '@/features/agenda/application/agenda-creation-scope';
import { calculateAgenda } from '@/features/agenda/application/agenda-service';
import { agendaGenerationSchema, validationMessage } from '@/features/agenda/domain/validation';
import { agendaErrorResponse } from '@/features/agenda/presentation/http';
import { requireAgendaApi } from '@/lib/auth/api-guards';

export async function POST(request: Request) {
  const auth = await requireAgendaApi('agenda.create');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  try {
    const parsed = agendaGenerationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: validationMessage(parsed.error) }, { status: 400 });
    }
    await assertAgendaCreationScope(auth.auth.empleadoId, parsed.data.sedeId);
    const result = await calculateAgenda(parsed.data);
    return NextResponse.json({ ok: true, preview: result.preview });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudo calcular la vista previa.');
  }
}
