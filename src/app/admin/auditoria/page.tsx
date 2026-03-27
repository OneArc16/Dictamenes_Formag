import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { Download, FileSpreadsheet, FilePenLine, LockKeyhole, RotateCcw } from 'lucide-react';

import RecomendacionesAuditoriaFilters from '@/components/admin/auditoria/RecomendacionesAuditoriaFilters';
import {
  buildAuditQueryString,
  buildDictamenAuditWhere,
  buildRecomendacionAuditWhere,
  formatAuditDateTime,
  fullName,
  normalizeModulo,
  type AuditModulo,
  type AuditTipo,
} from '@/lib/admin/auditoria';
import { RecomendacionStatusBadge } from '@/components/recomendaciones/detail/RecomendacionStatusBadge';
import { requireAdmin } from '@/lib/auth/guards';
import {
  buildDictamenHistoryChanges,
  parseDictamenHistorySnapshot,
} from '@/lib/dictamen/historial';
import {
  buildRecomendacionHistoryChanges,
  parseRecomendacionHistorySnapshot,
} from '@/lib/recomendaciones/historial';
import { prisma } from '@/lib/prisma';

type Props = {
  searchParams?: Promise<{
    q?: string;
    tipo?: string;
    modulo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: string;
  }>;
};

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

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

const dictamenEstadoConfig: Record<
  DictamenEstado,
  { label: string; className: string }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  },
  REABIERTO: {
    label: 'Reabierto',
    className: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  },
  CERRADO: {
    label: 'Cerrado',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  },
};

function DictamenStatusBadge({ estado }: { estado: DictamenEstado }) {
  const config = dictamenEstadoConfig[estado];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold',
        config.className,
      ].join(' ')}
    >
      {config.label}
    </span>
  );
}

function PaginationControls({
  safePage,
  totalPages,
  buildHref,
}: {
  safePage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2">
      <span className="text-[11px] text-slate-500">
        Pagina {safePage} de {totalPages}
      </span>

      <div className="flex items-center gap-2">
        {safePage > 1 ? (
          <Link
            href={buildHref(safePage - 1)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Anterior
          </Link>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-400">
            Anterior
          </span>
        )}

        {safePage < totalPages ? (
          <Link
            href={buildHref(safePage + 1)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Siguiente
          </Link>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-400">
            Siguiente
          </span>
        )}
      </div>
    </div>
  );
}

function ExportButtons({
  csvHref,
  excelHref,
  disabled,
}: {
  csvHref: string;
  excelHref: string;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-400">
          <Download className="h-3.5 w-3.5" />
          Descargar CSV
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-400">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Descargar Excel
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={csvHref}
        className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <Download className="h-3.5 w-3.5" />
        Descargar CSV
      </a>
      <a
        href={excelHref}
        className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 shadow-sm hover:bg-emerald-100"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Descargar Excel
      </a>
    </div>
  );
}

export default async function AuditoriaPage({ searchParams }: Props) {
  await requireAdmin();

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const tipo = (sp.tipo ?? 'all').trim().toUpperCase();
  const modulo = normalizeModulo(sp.modulo ?? 'RECOMENDACIONES') as AuditModulo;
  const fechaDesde = (sp.fechaDesde ?? '').trim();
  const fechaHasta = (sp.fechaHasta ?? '').trim();

  const pageSize = 25;
  const requestedPage = Number(sp.page ?? 1);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const buildHref = (nextPage: number) => {
    const query = buildAuditQueryString({
      q,
      tipo,
      modulo,
      fechaDesde,
      fechaHasta,
      page: nextPage,
    });

    return query ? `/admin/auditoria?${query}` : '/admin/auditoria';
  };

  const exportQuery = buildAuditQueryString({
    q,
    tipo,
    modulo,
    fechaDesde,
    fechaHasta,
  });
  const exportHref = exportQuery
    ? `/api/admin/auditoria/export?${exportQuery}`
    : '/api/admin/auditoria/export';
  const exportExcelHref = exportQuery
    ? `/api/admin/auditoria/export?${exportQuery}&format=xlsx`
    : '/api/admin/auditoria/export?format=xlsx';

  if (modulo === 'DICTAMENES') {
    const where = buildDictamenAuditWhere({ q, tipo, fechaDesde, fechaHasta });

    const total = await prisma.dictamenHistorial.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const items = await prisma.dictamenHistorial.findMany({
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
        dictamen: {
          select: {
            id: true,
            numeroDictamen: true,
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
    });

    const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const to = Math.min(safePage * pageSize, total);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Auditoría operativa</h1>
            <p className="text-[11px] text-slate-500">
              Mostrando {from}-{to} de {total} eventos registrados en dictámenes
            </p>
          </div>
        </div>

        <RecomendacionesAuditoriaFilters
          initialQ={q}
          initialTipo={tipo}
          initialModulo={modulo}
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
                  const docente = item.dictamen.usuario;
                  const actor = item.empleado;
                  const medicoResponsable = item.dictamen.empleado;
                  const config = eventConfig[item.tipo as AuditTipo];
                  const EventIcon = config.Icon;
                  const cambios = buildDictamenHistoryChanges(
                    parseDictamenHistorySnapshot(item.formularioAnterior as Prisma.JsonValue | null),
                    parseDictamenHistorySnapshot(item.formularioNuevo as Prisma.JsonValue | null),
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
                      <td className="px-3 py-3 align-top text-slate-500">{formatAuditDateTime(item.createdAt)}</td>

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
                              <DictamenStatusBadge estado={item.estadoAnterior as DictamenEstado} />
                              <span className="text-slate-400">→</span>
                              <DictamenStatusBadge estado={item.estadoNuevo as DictamenEstado} />
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
                            <p className="leading-5">{cambios.map((cambio) => cambio.etiqueta).join(', ')}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500">Solo cambio de estado</span>
                        )}
                      </td>

                      <td className="px-3 py-3 align-top">
                        <div className="flex flex-col items-start gap-2">
                          <Link
                            href={`/admisiones/dictamenes/${item.dictamen.id}`}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                          >
                            Ver dictamen
                          </Link>
                          <span className="text-[10px] text-slate-400">
                            N.° {item.dictamen.numeroDictamen ?? '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <PaginationControls safePage={safePage} totalPages={totalPages} buildHref={buildHref} />
        </div>
      </div>
    );
  }
  const where = buildRecomendacionAuditWhere({ q, tipo, fechaDesde, fechaHasta });

  const total = await prisma.recomendacionLaboralHistorial.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * pageSize;

  const items = await prisma.recomendacionLaboralHistorial.findMany({
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
  });

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Auditoría operativa</h1>
          <p className="text-[11px] text-slate-500">
            Mostrando {from}-{to} de {total} eventos registrados en recomendaciones
          </p>
        </div>
        <ExportButtons csvHref={exportHref} excelHref={exportExcelHref} disabled={total === 0} />
      </div>

      <RecomendacionesAuditoriaFilters
        initialQ={q}
        initialTipo={tipo}
        initialModulo={modulo}
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
                    <td className="px-3 py-3 align-top text-slate-500">{formatAuditDateTime(item.createdAt)}</td>

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
                          <p className="leading-5">{cambios.map((cambio) => cambio.etiqueta).join(', ')}</p>
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

        <PaginationControls safePage={safePage} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}
