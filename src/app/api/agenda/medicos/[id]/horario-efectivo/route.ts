import { NextResponse } from 'next/server';

import { assertAgendaCreationScope } from '@/features/agenda/application/agenda-creation-scope';
import { getEffectiveWorkSchedule } from '@/features/agenda/application/schedule-service';
import { agendaErrorResponse } from '@/features/agenda/presentation/http';
import { requireAgendaApi } from '@/lib/auth/api-guards';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAgendaApi('agenda.create');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const medicoId = Number((await context.params).id);
  const sedeId = Number(new URL(request.url).searchParams.get('sedeId'));
  if (!Number.isInteger(medicoId) || medicoId <= 0) {
    return NextResponse.json({ ok: false, error: 'El médico no es válido.' }, { status: 400 });
  }
  if (!Number.isInteger(sedeId) || sedeId <= 0) {
    return NextResponse.json({ ok: false, error: 'La sede no es válida.' }, { status: 400 });
  }

  try {
    await assertAgendaCreationScope(auth.auth.empleadoId, sedeId);
    const schedule = await getEffectiveWorkSchedule(sedeId, medicoId);
    return NextResponse.json({ ok: true, schedule });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudo consultar el horario efectivo.');
  }
}
