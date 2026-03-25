import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { FilePenLine, LockKeyhole, RotateCcw } from 'lucide-react';

import RecomendacionesAuditoriaFilters from '@/components/admin/auditoria/RecomendacionesAuditoriaFilters';
import { RecomendacionStatusBadge } from '@/components/recomendaciones/detail/RecomendacionStatusBadge';
import { requireAdmin } from '@/lib/auth/guards';
import {
  buildRecomendacionHistoryChanges,
  parseRecomendacionHistorySnapshot,
} from '@/lib/recomendaciones/historial';
import { prisma } from '@/lib/prisma';

type Props = {
  searchParams?: Promise<{
    q?: string;
    tipo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: string;
  }>;
};

type AuditTipo = 'REAPERTURA' | 'EDICION' | 'CIERRE';

const eventConfig: Record<
  AuditTipo,
  { label: string; className: string; Icon: typeof RotateCcw }
> = {
  REAPERTURA: {
    label: 'Reapertura',
    className: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
    Icon: RotateCcw,
  },
  EDICION: {
    label: 'Edicion',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    Icon: FilePenLine,
  },
  CIERRE: {
    label: 'Cierre',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
    Icon: LockKeyhole,
  },
};

function fullName(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function formatDateTime(value: Date) {
  return value.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeDateStart(value: string) {
  return new Date(`${value}T00:00:00.000-05:00`);
}

function normalizeDateEnd(value: string) {
  return new Date(`${value}T23:59:59.999-05:00`);
}

export default async function AuditoriaPage({ searchParams }: Props) {
  await requireAdmin();

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const tipo = (sp.tipo ?? 'all').trim().toUpperCase();
  const fechaDesde = (sp.fechaDesde ?? '').trim();
  const fechaHasta = (sp.fechaHasta ?? '').trim();

  const pageSize = 25;
  const requestedPage = Number(sp.page ?? 1);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const skip = (page - 1) * pageSize;

  const where: Prisma.RecomendacionLaboralHistorialWhereInput = {};

  if (tipo === 'REAPERTURA' || tipo === 'EDICION' || tipo === 'CIERRE') {
    where.tipo = tipo as AuditTipo;
  }

  if (fechaDesde || fechaHasta) {
    where.createdAt = {};
    if (fechaDesde) where.createdAt.gte = normalizeDateStart(fechaDesde);
    if (fechaHasta) where.createdAt.lte = normalizeDateEnd(fechaHasta);
  }

  if (q) {
    where.OR = [
      { motivoReapertura: { nombre: { contains: q, mode: 'insensitive' } } },
      { recomendacionLaboral: { numeroRecomendacion: { contains: q, mode: 'insensitive' } } },
      { recomendacionLaboral: { usuario: { identificacion: { contains: q, mode: 'insensitive' } } } },
      { recomendacionLaboral: { usuario: { primerNombre: { contains: q, mode: 'insensitive' } } } },
      { recomendacionLaboral: { usuario: { segundoNombre: { contains: q, mode: 'insensitive' } } } },
      { recomendacionLaboral: { usuario: { primerApellido: { contains: q, mode: 'insensitive' } } } },
      { recomendacionLaboral: { usuario: { segundoApellido: { contains: q, mode: 'insensitive' } } } },
      { empleado: { primerNombre: { contains: q, mode: 'insensitive' } } },
      { empleado: { segundoNombre: { contains: q, mode: 'insensitive' } } },
      { empleado: { primerApellido: { contains: q, mode: 'insensitive' } } },
      { empleado: { segundoApellido: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.recomendacionLaboralHistorial.count({ where }),
    prisma.recomendacionLaboralHistorial.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take: pageSize,
      select: {
        id: true,
        tipo: true,
        createdAt: true,
        estadoAnterior: true,
        estadoNuevo: true,
        formularioAnterior: true,
        formularioNuevo: true,
        motivoReapertura: {
          select: {
            nombre: true,
          },
        },
        empleado: {
          select: {
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
          },
        },
        recomendacionLaboral: {
          select: {
            id: true,
            numeroRecomendacion: true,
            usuario: {
              select: {
                identificacion: true,
                primerNombre: true,
                segundoNombre: true,
                primerApellido: true,
                segundoApellido: true,
              },
            },
            empleado: {
              select: {
                primerNombre: true,
                segundoNombre: true,
                primerApellido: true,
                segundoApellido: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tipo !== 'all') params.set('tipo', tipo);
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);
    if (nextPage > 1) params.set('page', String(nextPage));
    const query = params.toString();
    return query ? `/admin/auditoria?${query}` : '/admin/auditoria';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Auditoría de recomendaciones</h1>
          <p className="text-[11px] text-slate-500">
            Mostrando {from}-{to} de {total} eventos registrados
          </p>
        </div>
      </div>

      <RecomendacionesAuditoriaFilters
        initialQ={q}
        initialTipo={tipo}
        initialFechaDesde={fechaDesde}
        initialFechaHasta={fechaHasta}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Evento</th>
              <th className="px-3 py-2">Docente</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Motivo</th>
              <th className="px-3 py-2">Cambios</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={7}>
                  No hay eventos para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const docente = item.recomendacionLaboral.usuario;
                const actor = item.empleado;
                const medicoResponsable = item.recomendacionLaboral.empleado;
                const config = eventConfig[item.tipo as AuditTipo];
                const EventIcon = config.Icon;
                const cambios = buildRecomendacionHistoryChanges(
                  parseRecomendacionHistorySnapshot(item.formularioAnterior as Prisma.JsonValue | null),
                  parseRecomendacionHistorySnapshot(item.formularioNuevo as Prisma.JsonValue | null),
                );

                const docenteNombre =
                  fullName(
                    docente.primerNombre,
                    docente.segundoNombre,
                    docente.primerApellido,
                    docente.segundoApellido,
                  ) || 'Docente no disponible';

                const actorNombre =
                  fullName(
                    actor?.primerNombre,
                    actor?.segundoNombre,
                    actor?.primerApellido,
                    actor?.segundoApellido,
                  ) || 'Usuario no disponible';

                const medicoNombre =
                  fullName(
                    medicoResponsable?.primerNombre,
                    medicoResponsable?.segundoNombre,
                    medicoResponsable?.primerApellido,
                    medicoResponsable?.segundoApellido,
                  ) || 'Sin medico asignado';

                return (
                  <tr key={item.id} className="text-slate-700">
                    <td className="px-3 py-3 align-top text-slate-500">
                      {formatDateTime(item.createdAt)}
                    </td>

                    <td className="px-3 py-3 align-top">
                      <div className="space-y-2">
                        <span
                          className={[
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold',
                            config.className,
                          ].join(' ')}
                        >
                          <EventIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>

                        {item.estadoAnterior && item.estadoNuevo ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <RecomendacionStatusBadge estado={item.estadoAnterior} />
                            <span className="text-slate-400">→</span>
                            <RecomendacionStatusBadge estado={item.estadoNuevo} />
                          </div>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-3 py-3 align-top">
                      <p className="font-medium text-slate-900">{docenteNombre}</p>
                      <p className="mt-1 text-slate-500">CC {docente.identificacion}</p>
                      <p className="mt-1 text-slate-500">{medicoNombre}</p>
                    </td>

                    <td className="px-3 py-3 align-top text-slate-600">{actorNombre}</td>

                    <td className="px-3 py-3 align-top text-slate-600">
                      {item.motivoReapertura?.nombre ?? '—'}
                    </td>

                    <td className="px-3 py-3 align-top text-slate-600">
                      {cambios.length > 0 ? (
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">
                            {cambios.length} cambio{cambios.length === 1 ? '' : 's'}
                          </p>
                          <p className="leading-5">
                            {cambios.map((cambio) => cambio.etiqueta).join(', ')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500">Solo cambio de estado</span>
                      )}
                    </td>

                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-col items-start gap-2">
                        <Link
                          href={`/recomendaciones/${item.recomendacionLaboral.id}`}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                          Ver recomendación
                        </Link>
                        <span className="text-[10px] text-slate-400">
                          Ref. {item.recomendacionLaboral.numeroRecomendacion ?? '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2">
          <span className="text-[11px] text-slate-500">
            Página {safePage} de {totalPages}
          </span>

          <div className="flex items-center gap-2">
            {safePage > 1 ? (
              <Link
                href={buildHref(safePage - 1)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-400">
                ← Anterior
              </span>
            )}

            {safePage < totalPages ? (
              <Link
                href={buildHref(safePage + 1)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-400">
                Siguiente →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
