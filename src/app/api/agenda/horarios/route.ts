import { NextResponse } from 'next/server';

import { createWorkSchedule, listWorkSchedules } from '@/features/agenda/application/schedule-service';
import { validationMessage, workScheduleSchema } from '@/features/agenda/domain/validation';
import { agendaErrorResponse, auditActor } from '@/features/agenda/presentation/http';
import { requireAnyAbilityApi, requireAgendaApi } from '@/lib/auth/api-guards';

export async function GET(request: Request) {
  const auth = await requireAnyAbilityApi(['agenda.read', 'agenda.create', 'agenda.schedule.manage']);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const url = new URL(request.url);
  const sedeId = Number(url.searchParams.get('sedeId'));
  if (!Number.isInteger(sedeId) || sedeId <= 0) {
    return NextResponse.json({ ok: false, error: 'La sede es obligatoria.' }, { status: 400 });
  }
  const medicoParam = url.searchParams.get('medicoId');
  const medicoId = medicoParam === null ? undefined : medicoParam === 'sede' ? null : Number(medicoParam);
  if (typeof medicoId === 'number' && (!Number.isInteger(medicoId) || medicoId <= 0)) {
    return NextResponse.json({ ok: false, error: 'El médico no es válido.' }, { status: 400 });
  }
  const rows = await listWorkSchedules({
    sedeId,
    medicoId,
    includeInactive: url.searchParams.get('includeInactive') === 'true',
  });
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: Request) {
  const auth = await requireAgendaApi('agenda.schedule.manage');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  try {
    const parsed = workScheduleSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: validationMessage(parsed.error) }, { status: 400 });
    }
    const result = await createWorkSchedule(parsed.data, auditActor(auth.payload));
    return NextResponse.json({ ok: true, id: result.id }, { status: 201 });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudo crear el horario laboral.');
  }
}
