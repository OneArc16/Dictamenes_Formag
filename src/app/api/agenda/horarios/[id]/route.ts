import { NextResponse } from 'next/server';

import { updateWorkSchedule } from '@/features/agenda/application/schedule-service';
import { validationMessage, workScheduleSchema } from '@/features/agenda/domain/validation';
import { agendaErrorResponse, auditActor } from '@/features/agenda/presentation/http';
import { requireAgendaApi } from '@/lib/auth/api-guards';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAgendaApi('agenda.schedule.manage');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'Horario inválido.' }, { status: 400 });
  }
  try {
    const parsed = workScheduleSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: validationMessage(parsed.error) }, { status: 400 });
    }
    await updateWorkSchedule(id, parsed.data, auditActor(auth.payload));
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudo actualizar el horario laboral.');
  }
}
