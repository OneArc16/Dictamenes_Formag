import { NextResponse } from 'next/server';

import { assertAgendaCreationScope } from '@/features/agenda/application/agenda-creation-scope';
import { confirmAgendaGeneration } from '@/features/agenda/application/agenda-service';
import { agendaReadScope } from '@/features/agenda/application/query-scope';
import { confirmAgendaGenerationSchema, validationMessage } from '@/features/agenda/domain/validation';
import { agendaErrorResponse, auditActor } from '@/features/agenda/presentation/http';
import { requireAgendaApi, requireAnyAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const auth = await requireAnyAbilityApi(['agenda.read', 'agenda.read.own']);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const scope = await agendaReadScope(auth.auth);
  if (!scope.medicoId && !scope.sedeId) {
    return NextResponse.json({ ok: true, rows: [], total: 0 });
  }
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize')) || 20));
  const where = {
    ...(scope.medicoId ? { medicos: { some: { medicoId: scope.medicoId } } } : { sedeId: scope.sedeId! }),
  };
  const [rows, total] = await Promise.all([
    prisma.generacionAgenda.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fechaInicial: true,
        fechaFinal: true,
        duracionMinutos: true,
        estado: true,
        totalMedicos: true,
        totalCandidatos: true,
        totalCreados: true,
        totalOmitidos: true,
        totalConflictos: true,
        createdAt: true,
        createdBy: true,
        sede: { select: { nombre: true } },
      },
    }),
    prisma.generacionAgenda.count({ where }),
  ]);
  return NextResponse.json({
    ok: true,
    total,
    rows: rows.map((row) => ({
      ...row,
      fechaInicial: row.fechaInicial.toISOString().slice(0, 10),
      fechaFinal: row.fechaFinal.toISOString().slice(0, 10),
      createdAt: row.createdAt.toISOString(),
      sedeNombre: row.sede.nombre,
      sede: undefined,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireAgendaApi('agenda.create');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  try {
    const parsed = confirmAgendaGenerationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: validationMessage(parsed.error) }, { status: 400 });
    }
    await assertAgendaCreationScope(auth.auth.empleadoId, parsed.data.sedeId);
    const result = await confirmAgendaGeneration(parsed.data, auditActor(auth.payload));
    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudo confirmar la generación de agenda.');
  }
}
