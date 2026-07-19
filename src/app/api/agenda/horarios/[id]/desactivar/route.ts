import { NextResponse } from 'next/server';

import { deactivateWorkSchedule } from '@/features/agenda/application/schedule-service';
import { agendaErrorResponse, auditActor } from '@/features/agenda/presentation/http';
import { requireAgendaApi } from '@/lib/auth/api-guards';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAgendaApi('agenda.schedule.manage');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'Horario inválido.' }, { status: 400 });
  }
  try {
    await deactivateWorkSchedule(id, auditActor(auth.payload));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudo desactivar el horario laboral.');
  }
}
