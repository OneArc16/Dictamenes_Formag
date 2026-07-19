import { NextResponse } from 'next/server';

import { agendaReadScope } from '@/features/agenda/application/query-scope';
import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { requireAnyAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAnyAbilityApi(['agenda.read', 'agenda.read.own']);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'Generación inválida.' }, { status: 400 });
  }
  const scope = await agendaReadScope(auth.auth);
  const row = await prisma.generacionAgenda.findFirst({
    where: {
      id,
      ...(scope.medicoId ? { medicos: { some: { medicoId: scope.medicoId } } } : { sedeId: scope.sedeId ?? -1 }),
    },
    include: {
      sede: { select: { nombre: true } },
      fechasExcluidas: { orderBy: [{ fecha: 'asc' }, { medicoId: 'asc' }] },
      medicos: {
        ...(scope.medicoId ? { where: { medicoId: scope.medicoId } } : {}),
        include: {
          medico: {
            select: {
              primerNombre: true,
              segundoNombre: true,
              primerApellido: true,
              segundoApellido: true,
            },
          },
          horarioLaboral: { select: { nombre: true, zonaHoraria: true } },
        },
        orderBy: { id: 'asc' },
      },
      cupos: {
        ...(scope.medicoId ? { where: { medicoId: scope.medicoId } } : {}),
        take: 500,
        orderBy: [{ inicio: 'asc' }, { medicoId: 'asc' }],
        select: { id: true, medicoId: true, inicio: true, fin: true, estado: true },
      },
    },
  });
  if (!row) return NextResponse.json({ ok: false, error: 'Generación no encontrada.' }, { status: 404 });

  return NextResponse.json({
    ok: true,
    generation: {
      id: row.id,
      sedeNombre: row.sede.nombre,
      fechaInicial: row.fechaInicial.toISOString().slice(0, 10),
      fechaFinal: row.fechaFinal.toISOString().slice(0, 10),
      duracionMinutos: row.duracionMinutos,
      zonaHoraria: row.zonaHoraria,
      estado: row.estado,
      totalMedicos: row.totalMedicos,
      totalCandidatos: row.totalCandidatos,
      totalCreados: row.totalCreados,
      totalOmitidos: row.totalOmitidos,
      totalConflictos: row.totalConflictos,
      createdAt: row.createdAt.toISOString(),
      createdBy: row.createdBy,
      medicos: row.medicos.map((item) => ({
        medicoId: item.medicoId,
        medicoNombre: employeeFullName(item.medico),
        horarioNombre: item.horarioLaboral.nombre,
        zonaHoraria: item.horarioLaboral.zonaHoraria,
        totalCandidatos: item.totalCandidatos,
        totalCreados: item.totalCreados,
        totalOmitidos: item.totalOmitidos,
        totalConflictos: item.totalConflictos,
      })),
      fechasExcluidas: row.fechasExcluidas.map((item) => ({
        medicoId: item.medicoId,
        fecha: item.fecha.toISOString().slice(0, 10),
        motivo: item.motivo,
      })),
      cupos: row.cupos.map((slot) => ({ ...slot, inicio: slot.inicio.toISOString(), fin: slot.fin.toISOString() })),
      cuposTruncados: row.totalCreados > row.cupos.length,
    },
  });
}
