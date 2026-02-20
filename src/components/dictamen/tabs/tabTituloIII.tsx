'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  FACTOR_GROUPS,
  FACTOR_LABELS,
  GRAVEDAD_ORDER,
  GRAVEDAD_LABEL,
  round2,
  type FactorKey,
  type GravedadAnalisisKey,
} from '@/lib/dictamen/titulo3';

type Titulo3Summary = {
  basePcl: number;
  counts: Record<GravedadAnalisisKey, number>;
  claseFinal: GravedadAnalisisKey | null;
  empate: boolean;
  empatadas: GravedadAnalisisKey[];
  porcentajeAdd: number;
  incrementoTitulo3: number;
  pclFinal: number;
};

type Titulo3Response = {
  dictamenId: number;
  basePcl: number;
  storedTotalTitulo3: number;
  aplicaAnalisisOcupacional: boolean;
  items: { factor: FactorKey; gravedad: GravedadAnalisisKey }[];
  naFactors?: FactorKey[];
  summary: Titulo3Summary;

  // ✅ viene de la API
  habilitado?: boolean;
};

type UpdateBody =
  | { factor: FactorKey; gravedad: GravedadAnalisisKey }
  | { factor: FactorKey; na: true }
  | { factor: FactorKey; remove: true };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

async function safeJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`API no devolvió JSON (${res.status}). Ej: ${text.slice(0, 120)}...`);
  }
  return res.json();
}

async function fetchTitulo3(dictamenId: number): Promise<Titulo3Response> {
  const res = await fetch(`/api/dictamenes/${dictamenId}/titulo3`, { cache: 'no-store' });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message ?? 'Error cargando Título III');
  return data;
}

async function updateTitulo3(dictamenId: number, body: UpdateBody) {
  const res = await fetch(`/api/dictamenes/${dictamenId}/titulo3`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message ?? 'Error guardando Título III');
  return data as {
    basePcl: number;
    items: Titulo3Response['items'];
    naFactors: FactorKey[];
    summary: Titulo3Summary;
  };
}

/** UI helpers estilo Dictamy */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-slate-200 shadow-sm rounded-xl', className)}>
      {children}
    </div>
  );
}

function CardHeader({
  title,
  right,
  subtitle,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
        </div>
        {right}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700">
      {children}
    </span>
  );
}

function SmallMuted({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-xs text-slate-500', className)}>{children}</div>;
}

function GravedadSegment({
  value,
  disabled,
  onChange,
}: {
  value: GravedadAnalisisKey | null;
  disabled?: boolean;
  onChange: (g: GravedadAnalisisKey) => void;
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-slate-200 overflow-hidden bg-white',
        disabled && 'opacity-60 pointer-events-none',
      )}
    >
      {GRAVEDAD_ORDER.map((g) => {
        const selected = value === g;
        return (
          <button
            key={g}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(g)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition',
              selected ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50',
            )}
            title={`Marcar ${GRAVEDAD_LABEL[g]}`}
          >
            {GRAVEDAD_LABEL[g]}
          </button>
        );
      })}
    </div>
  );
}

export default function TabTituloIII({
  dictamenId,
  procedimientoPcl,
}: {
  dictamenId: number;
  procedimientoPcl?: 'A' | 'B';
}) {
  // ✅ Hooks SIEMPRE en el mismo orden
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [onlyPending, setOnlyPending] = useState(false);
  const [openMetodologia, setOpenMetodologia] = useState(false);
  const [savingFactor, setSavingFactor] = useState<FactorKey | null>(null);

  const isProcA = procedimientoPcl === 'A';
  const isProcB = procedimientoPcl === 'B';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dictamen', dictamenId, 'titulo3'],
    queryFn: () => fetchTitulo3(dictamenId),
    enabled: !!dictamenId && isProcA, // ✅ Solo controla el fetch, NO el hook
  });

  const mutation = useMutation({
    mutationFn: (body: UpdateBody) => updateTitulo3(dictamenId, body),

    onMutate: async (body) => {
      setSavingFactor(body.factor);

      await queryClient.cancelQueries({ queryKey: ['dictamen', dictamenId, 'titulo3'] });

      const prev = queryClient.getQueryData<Titulo3Response>(['dictamen', dictamenId, 'titulo3']);
      if (!prev) return { prev };

      const itemsMap = new Map(prev.items.map((it) => [it.factor, it.gravedad]));
      const naSet = new Set(prev.naFactors ?? []);

      if ('remove' in body) {
        itemsMap.delete(body.factor);
        naSet.delete(body.factor);
      } else if ('na' in body) {
        itemsMap.delete(body.factor);
        naSet.add(body.factor);
      } else {
        naSet.delete(body.factor);
        itemsMap.set(body.factor, body.gravedad);
      }

      const next: Titulo3Response = {
        ...prev,
        items: Array.from(itemsMap.entries()).map(([factor, gravedad]) => ({ factor, gravedad })),
        naFactors: Array.from(naSet),
      };

      queryClient.setQueryData(['dictamen', dictamenId, 'titulo3'], next);
      return { prev };
    },

    onError: (err, _body, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['dictamen', dictamenId, 'titulo3'], ctx.prev);
      toast.error(err instanceof Error ? err.message : 'Error guardando');
    },

    onSuccess: (server) => {
      const prev = queryClient.getQueryData<Titulo3Response>(['dictamen', dictamenId, 'titulo3']);
      if (!prev) return;

      queryClient.setQueryData<Titulo3Response>(['dictamen', dictamenId, 'titulo3'], {
        ...prev,
        basePcl: server.basePcl,
        items: server.items,
        naFactors: server.naFactors ?? [],
        summary: server.summary,
      });

      queryClient.invalidateQueries({
        queryKey: ['dictamen-deficiencias-panel', dictamenId],
        exact: false,
      });
    },

    onSettled: () => setSavingFactor(null),
  });

  const itemsMap = useMemo(() => {
    const m = new Map<FactorKey, GravedadAnalisisKey>();
    if (data?.items) for (const it of data.items) m.set(it.factor, it.gravedad);
    return m;
  }, [data?.items]);

  const naSet = useMemo(() => new Set<FactorKey>(data?.naFactors ?? []), [data?.naFactors]);

  const basePcl = data?.summary?.basePcl ?? data?.basePcl ?? 0;
  const faltante = round2(Math.max(0, 100 - basePcl));

  // ✅ Regla negocio final (API manda habilitado, si no viene usamos faltante)
  const habilitado = isProcA && (data?.habilitado ?? faltante > 0);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    return FACTOR_GROUPS.map((g) => {
      const factors = g.factors.filter((f) => {
        const label = (FACTOR_LABELS[f] ?? '').toLowerCase();
        const matchesSearch = !normalizedSearch || label.includes(normalizedSearch);

        const isAnswered = itemsMap.has(f);
        const isNa = naSet.has(f);
        const isPending = !isAnswered && !isNa;

        const matchesPending = !onlyPending || isPending;

        return matchesSearch && matchesPending;
      });

      return { ...g, factors };
    }).filter((g) => g.factors.length > 0);
  }, [normalizedSearch, onlyPending, itemsMap, naSet]);

  // ✅ Returns condicionales (DESPUÉS de hooks)
  if (isProcB) {
    return (
      <Card>
        <CardHeader title="Título III" subtitle="No aplica (solo Procedimiento A)." />
        <div className="p-4">
          <SmallMuted>Este dictamen está en Procedimiento B, por lo tanto no aplica Título III.</SmallMuted>
        </div>
      </Card>
    );
  }

  if (!procedimientoPcl) {
    return (
      <Card>
        <CardHeader title="Título III" subtitle="No aplica (seleccione primero el procedimiento)." />
        <div className="p-4">
          <SmallMuted>
            Cuando el procedimiento sea A, aquí se habilitará el análisis ocupacional solo si hace falta para llegar al 100%.
          </SmallMuted>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Título III" />
        <div className="p-4">
          <SmallMuted>Cargando…</SmallMuted>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader title="Título III" subtitle="Ocurrió un error cargando la sección." />
        <div className="p-4">
          <SmallMuted className="text-red-600">{error instanceof Error ? error.message : 'Error'}</SmallMuted>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Reintentar
          </button>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  // ✅ No aplica cuando ya llegó a 100%
  if (!habilitado) {
    return (
      <Card>
        <CardHeader
          title="Título III"
          subtitle={
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge>Procedimiento: A</Badge>
              <Badge>Base PCL (T1 + T2 Cap.2): {basePcl.toFixed(2)}%</Badge>
              <Badge>Pendiente vs 100%: {faltante.toFixed(2)}%</Badge>
              <Badge>No aplica</Badge>
            </div>
          }
        />
        <div className="p-4">
          <SmallMuted>
            No aplica porque la sumatoria (Título I + Título II Capítulo 2) ya alcanza 100%.
          </SmallMuted>
        </div>
      </Card>
    );
  }

  const summary = data.summary;
  const counts = summary?.counts ?? { CERO: 0, I: 0, II: 0, III: 0, IV: 0 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      {/* ================= MAIN ================= */}
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Título III — Análisis ocupacional del educador"
            right={
              <button
                type="button"
                onClick={() => setOpenMetodologia((v) => !v)}
                className="inline-flex items-center justify-center px-3 py-2 text-sm bg-white border rounded-lg border-slate-200 hover:bg-slate-50"
              >
                {openMetodologia ? 'Ocultar metodología' : 'Ver metodología'}
              </button>
            }
            subtitle={
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>Procedimiento: A</Badge>
                <Badge>Base PCL (T1 + T2 Cap.2): {basePcl.toFixed(2)}%</Badge>
                <Badge>Pendiente vs 100%: {faltante.toFixed(2)}%</Badge>
              </div>
            }
          />
          {openMetodologia && (
            <div className="p-4">
              <div className="p-3 text-sm leading-relaxed border rounded-lg border-slate-200 bg-slate-50">
                <div className="mb-2 font-medium text-slate-900">Metodología (resumen)</div>
                <ul className="pl-5 space-y-1 list-disc text-slate-700">
                  <li>Marque la gravedad (0, I, II, III, IV) para cada factor aplicable.</li>
                  <li>
                    Si no aplica, marque <b>N/A</b>.
                  </li>
                  <li>
                    Se suman las marcas por columna; la <b>clase final</b> es la de mayor sumatoria.
                  </li>
                  <li>Clase → %: 0→0%, I→8%, II→16%, III→24%, IV→32%.</li>
                  <li>Incremento = Base PCL × (%/100). PCL final = Base PCL + incremento.</li>
                </ul>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Filtros" />
          <div className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <label className="text-xs text-slate-500">Buscar factor</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ej: memoria, visión, equilibrio…"
                  className="w-full px-3 py-2 mt-1 text-sm bg-white border rounded-lg outline-none border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
                <SmallMuted className="mt-2">Pendiente = sin selección y sin N/A.</SmallMuted>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyPending}
                  onChange={(e) => setOnlyPending(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                Mostrar solo pendientes
              </label>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardHeader title="Factores" />
              <div className="p-4">
                <SmallMuted>No hay factores que coincidan con el filtro.</SmallMuted>
              </div>
            </Card>
          ) : (
            filteredGroups.map((group) => (
              <details key={group.key} open className="bg-white border shadow-sm border-slate-200 rounded-xl">
                <summary className="px-4 py-3 border-b cursor-pointer select-none border-slate-200 bg-slate-50 rounded-t-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">{group.label}</div>
                    <SmallMuted>{group.factors.length} factor(es)</SmallMuted>
                  </div>
                </summary>

                <div className="px-4 pt-2 pb-4">
                  <div className="overflow-x-auto">
                    <div className="min-w-[720px]">
                      <div className="grid grid-cols-[1fr_110px_380px_120px] gap-3 px-2 py-2 text-xs font-medium text-slate-500">
                        <div>Factor</div>
                        <div>N/A</div>
                        <div>Gravedad</div>
                        <div>Estado</div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      {group.factors.map((factor) => {
                        const isNa = naSet.has(factor);
                        const gravedad = itemsMap.get(factor) ?? null;

                        const answered = !!gravedad;
                        const pending = !answered && !isNa;

                        return (
                          <div
                            key={factor}
                            className="grid grid-cols-[1fr_110px_380px_120px] gap-3 px-2 py-3 items-center"
                          >
                            <div className="text-sm font-medium text-slate-900">{FACTOR_LABELS[factor]}</div>

                            <div>
                              <input
                                type="checkbox"
                                checked={isNa}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  if (checked) mutation.mutate({ factor, na: true });
                                  else mutation.mutate({ factor, remove: true });
                                }}
                                className="w-4 h-4 rounded border-slate-300"
                                disabled={mutation.isPending}
                              />
                            </div>

                            <div>
                              <GravedadSegment
                                value={gravedad}
                                disabled={isNa || mutation.isPending}
                                onChange={(g) => mutation.mutate({ factor, gravedad: g })}
                              />
                            </div>

                            <div className="text-xs">
                              {savingFactor === factor ? (
                                <span className="text-slate-500">Guardando…</span>
                              ) : isNa ? (
                                <span className="text-slate-500">N/A</span>
                              ) : pending ? (
                                <span className="font-medium text-amber-600">Pendiente</span>
                              ) : (
                                <span className="font-medium text-emerald-600">Listo</span>
                              )}
                            </div>

                            <div className="h-px col-span-4 bg-slate-100" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </details>
            ))
          )}
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="space-y-4 lg:sticky lg:top-4 h-fit">
        <Card>
          <CardHeader title="Resumen" right={<Badge>{(data.naFactors?.length ?? 0)} N/A</Badge>} />
          <div className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {GRAVEDAD_ORDER.map((g) => (
                <div key={g} className="p-2 text-center bg-white border rounded-lg border-slate-200">
                  <div className="text-xs text-slate-500">{GRAVEDAD_LABEL[g]}</div>
                  <div className="text-lg font-semibold text-slate-900">{counts?.[g] ?? 0}</div>
                </div>
              ))}
            </div>

            {summary.empate && (
              <div className="p-3 mt-3 text-sm border rounded-lg border-amber-200 bg-amber-50 text-amber-900">
                <div className="font-medium">Empate detectado</div>
                <div className="mt-1 text-xs">
                  Empate entre: {summary.empatadas.map((e) => GRAVEDAD_LABEL[e]).join(', ')}. Se tomó la mayor.
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Clase final</span>
                <span className="font-semibold text-slate-900">
                  {summary.claseFinal ? GRAVEDAD_LABEL[summary.claseFinal] : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">% a agregar</span>
                <span className="font-semibold text-slate-900">
                  {summary.claseFinal ? `${summary.porcentajeAdd}%` : '—'}
                </span>
              </div>

              <div className="h-px my-2 bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Base PCL (T1 + T2 Cap.2)</span>
                <span className="font-semibold text-slate-900">{basePcl.toFixed(2)}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Incremento (Título III)</span>
                <span className="font-semibold text-slate-900">
                  {summary.claseFinal ? `${summary.incrementoTitulo3.toFixed(2)}%` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">PCL final</span>
                <span className="font-semibold text-slate-900">
                  {summary.claseFinal ? `${summary.pclFinal.toFixed(2)}%` : '—'}
                </span>
              </div>

              <SmallMuted className="mt-2">
                Guardado en dictamen.totalTitulo3: {Number(data.storedTotalTitulo3 ?? 0).toFixed(2)}%
              </SmallMuted>
            </div>

            <button
              type="button"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId, 'titulo3'] });
                toast.success('Resumen actualizado');
              }}
              className="inline-flex items-center justify-center w-full px-3 py-2 mt-4 text-sm bg-white border rounded-lg border-slate-200 hover:bg-slate-50"
            >
              Recalcular / Refrescar
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Notas" />
          <div className="p-4">
            <SmallMuted>
              - “N/A” no cuenta en la sumatoria. <br />
              - “Pendiente” = sin selección y sin N/A. <br />
              - El incremento se calcula sobre la Base PCL (T1 + T2 Cap.2).
            </SmallMuted>
          </div>
        </Card>
      </div>
    </div>
  );
}