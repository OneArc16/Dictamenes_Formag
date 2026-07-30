import { NextResponse } from 'next/server';

import { assertAgendaCreationScope } from '@/features/agenda/application/agenda-creation-scope';
import { listSchedulableDoctors } from '@/features/agenda/infrastructure/schedulable-doctors';
import { agendaErrorResponse } from '@/features/agenda/presentation/http';
import { requireAnyAbilityApi } from '@/lib/auth/api-guards';
import { hasAbility } from '@/lib/auth/authorization';

export async function GET(request: Request) {
  const auth = await requireAnyAbilityApi(['agenda.create', 'agenda.schedule.manage', 'agenda.read']);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const sedeId = Number(url.searchParams.get('sedeId'));
  if (!Number.isInteger(sedeId) || sedeId <= 0) {
    return NextResponse.json({ ok: false, error: 'Selecciona una sede válida.' }, { status: 400 });
  }

  try {
    if (
      !hasAbility(auth.auth, 'agenda.schedule.manage') &&
      !hasAbility(auth.auth, 'agenda.site.select')
    ) {
      await assertAgendaCreationScope(auth.auth.empleadoId, sedeId);
    }

    const options = await listSchedulableDoctors({
      sedeId,
      search: url.searchParams.get('search') ?? undefined,
      limit: 100,
    });
    return NextResponse.json({ ok: true, options });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudieron consultar los médicos.');
  }
}
