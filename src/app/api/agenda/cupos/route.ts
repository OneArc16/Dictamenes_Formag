import { NextResponse } from 'next/server';

import { agendaReadScope } from '@/features/agenda/application/query-scope';
import {
  SLOT_STATUSES,
  buildSlotWhere,
  parseSlotQuery,
  statusWhere,
  viewStatus,
} from '@/features/agenda/application/slot-query';
import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { requireAnyAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

const nameSelect = {
  primerNombre: true,
  segundoNombre: true,
  primerApellido: true,
  segundoApellido: true,
} as const;

export async function GET(request: Request) {
  const auth = await requireAnyAbilityApi(['agenda.read', 'agenda.read.own']);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const parsed = parseSlotQuery(new URL(request.url).searchParams);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  const filters = parsed.value;
  const scope = await agendaReadScope(auth.auth);

  const where = buildSlotWhere(filters, scope);
  const withoutStatus = buildSlotWhere(filters, scope, { medico: true, search: true });
  const [rows, total, statusCounts, doctorGroups] = await Promise.all([
    prisma.cupoMedico.findMany({
      where,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      orderBy: [{ inicio: 'asc' }, { medicoId: 'asc' }, { id: 'asc' }],
      include: {
        medico: { select: nameSelect },
        sede: { select: { nombre: true } },
        modalidad: { select: { nombre: true } },
        citas: {
          where: { estado: { in: ['ASIGNADA', 'ATENDIDA'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            estado: true,
            paciente: { select: { ...nameSelect, identificacion: true } },
          },
        },
      },
    }),
    prisma.cupoMedico.count({ where }),
    // "Atendido" depende de la cita, por eso cada estado se cuenta con su propio filtro.
    Promise.all(
      SLOT_STATUSES.map((status) => prisma.cupoMedico.count({ where: { AND: [withoutStatus, statusWhere(status)] } })),
    ),
    prisma.cupoMedico.groupBy({
      by: ['medicoId'],
      where: buildSlotWhere(filters, scope, {}),
      _count: { _all: true },
    }),
  ]);

  const doctors = await prisma.empleado.findMany({
    where: { id: { in: doctorGroups.map((group) => group.medicoId) } },
    select: { id: true, ...nameSelect },
  });
  const doctorTotals = new Map(doctorGroups.map((group) => [group.medicoId, group._count._all]));

  return NextResponse.json({
    ok: true,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    hasMore: filters.page * filters.pageSize < total,
    conteos: Object.fromEntries(SLOT_STATUSES.map((status, index) => [status, statusCounts[index]])),
    medicos: doctors
      .map((doctor) => ({ id: doctor.id, nombre: employeeFullName(doctor), total: doctorTotals.get(doctor.id) ?? 0 }))
      .sort((left, right) => left.nombre.localeCompare(right.nombre, 'es')),
    rows: rows.map((row) => {
      const cita = row.citas[0];
      return {
        id: row.id,
        medicoId: row.medicoId,
        medicoNombre: employeeFullName(row.medico),
        sedeNombre: row.sede.nombre,
        modalidadNombre: row.modalidad.nombre,
        inicio: row.inicio.toISOString(),
        fin: row.fin.toISOString(),
        duracionMinutos: row.duracionMinutos,
        estado: viewStatus(row.estado, cita?.estado),
        generacionId: row.generacionAgendaId,
        cancelacion:
          row.estado === 'CANCELADO'
            ? { motivo: row.motivoCancelacion, por: row.canceladoBy, en: row.canceladoAt?.toISOString() ?? null }
            : null,
        paciente: cita
          ? {
              nombre: employeeFullName(cita.paciente),
              documento: cita.paciente.identificacion,
              citaEstado: cita.estado,
            }
          : null,
      };
    }),
  });
}
