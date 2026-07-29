import { NextResponse } from 'next/server';

import { assertAgendaCreationScope } from '@/features/agenda/application/agenda-creation-scope';
import { getEffectiveWorkSchedules } from '@/features/agenda/application/schedule-service';
import { agendaErrorResponse } from '@/features/agenda/presentation/http';
import { requireAgendaApi } from '@/lib/auth/api-guards';

const MAX_DOCTORS = 50;

function parseDoctorIds(value: string | null) {
  if (!value) return null;
  const ids = value.split(',').map(Number);
  if (
    ids.length === 0 ||
    ids.length > MAX_DOCTORS ||
    ids.some((id) => !Number.isInteger(id) || id <= 0)
  ) {
    return null;
  }
  return [...new Set(ids)];
}

export async function GET(request: Request) {
  const auth = await requireAgendaApi('agenda.create');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const sedeId = Number(url.searchParams.get('sedeId'));
  const medicoIds = parseDoctorIds(url.searchParams.get('medicoIds'));
  if (!Number.isInteger(sedeId) || sedeId <= 0) {
    return NextResponse.json({ ok: false, error: 'La sede no es válida.' }, { status: 400 });
  }
  if (!medicoIds) {
    return NextResponse.json(
      { ok: false, error: 'Selecciona entre 1 y 50 médicos válidos.' },
      { status: 400 },
    );
  }

  try {
    await assertAgendaCreationScope(auth.auth.empleadoId, sedeId);
    const schedules = await getEffectiveWorkSchedules(sedeId, medicoIds);
    return NextResponse.json({ ok: true, schedules });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudieron consultar los horarios efectivos.');
  }
}
