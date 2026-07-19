import { NextResponse } from 'next/server';

import { agendaReadScope } from '@/features/agenda/application/query-scope';
import { differenceInCalendarDays, parseDateOnly } from '@/features/agenda/domain/date-time';
import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { requireAnyAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const auth = await requireAnyAbilityApi(['agenda.read', 'agenda.read.own']);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const url = new URL(request.url);
  const desde = url.searchParams.get('desde');
  const hasta = url.searchParams.get('hasta');
  if (!desde || !hasta || !/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
    return NextResponse.json({ ok: false, error: 'El rango de fechas es obligatorio.' }, { status: 400 });
  }
  if (differenceInCalendarDays(desde, hasta) < 0 || differenceInCalendarDays(desde, hasta) > 90) {
    return NextResponse.json({ ok: false, error: 'El rango consultado no puede superar 91 días.' }, { status: 400 });
  }
  const scope = await agendaReadScope(auth.auth);
  const requestedDoctor = Number(url.searchParams.get('medicoId')) || undefined;
  const medicoId = scope.medicoId ?? requestedDoctor;
  const status = url.searchParams.get('estado');
  const validStatuses = ['DISPONIBLE', 'RESERVADO', 'ASIGNADO', 'CANCELADO'] as const;
  if (status && !validStatuses.includes(status as (typeof validStatuses)[number])) {
    return NextResponse.json({ ok: false, error: 'El estado de cupo no es válido.' }, { status: 400 });
  }
  const endExclusive = parseDateOnly(hasta);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 2);
  const rows = await prisma.cupoMedico.findMany({
    where: {
      ...(medicoId ? { medicoId } : {}),
      ...(scope.sedeId ? { sedeId: scope.sedeId } : {}),
      inicio: { gte: parseDateOnly(desde), lt: endExclusive },
      ...(status ? { estado: status as (typeof validStatuses)[number] } : {}),
    },
    take: 500,
    orderBy: [{ inicio: 'asc' }, { medicoId: 'asc' }],
    include: {
      medico: {
        select: {
          primerNombre: true,
          segundoNombre: true,
          primerApellido: true,
          segundoApellido: true,
        },
      },
      sede: { select: { nombre: true } },
    },
  });
  return NextResponse.json({
    ok: true,
    rows: rows.map((row) => ({
      id: row.id,
      medicoId: row.medicoId,
      medicoNombre: employeeFullName(row.medico),
      sedeNombre: row.sede.nombre,
      inicio: row.inicio.toISOString(),
      fin: row.fin.toISOString(),
      estado: row.estado,
    })),
  });
}
