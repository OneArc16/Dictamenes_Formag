'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Printer, RefreshCw, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import { useCan } from '@/hooks/useCan';

import {
  useDictamenDeficienciasPanel,
  type DictamenPanelData,
} from '@/hooks/useDictamenDeficienciasPanel';
import { useCerrarDictamen } from '@/hooks/useCerrarDictamen';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { capPcl } from '@/lib/dictamen/pcl-cap';

type Props = {
  dictamenId?: number;
  procedimientoPcl?: 'A' | 'B';
  readOnly?: boolean;
};

type DictamenCacheShape = {
  readOnly?: boolean;
  serverVersion?: string;
  estado?: string;
  dictamenEstado?: string;
  dictamen?: {
    estado?: string;
    readOnly?: boolean;
  };
  data?: {
    readOnly?: boolean;
    estado?: string;
    dictamenEstado?: string;
    dictamen?: {
      estado?: string;
      readOnly?: boolean;
    };
  };
};

function onPrintReactPdf(dictamenId?: number) {
  if (!dictamenId) {
    toast.error('No se encontro el ID del dictamen');
    return;
  }
  window.open(`/api/dictamenes/${dictamenId}/pdf-react`, '_blank', 'noopener,noreferrer');
}

function TotalRow({
  label,
  hint,
  value,
  muted = false,
  emphasized = false,
}: {
  label: string;
  hint: string;
  value: string;
  muted?: boolean;
  emphasized?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2.5 ${emphasized ? 'bg-slate-50' : ''}`}>
      <div className="min-w-0">
        <dt className={`text-xs font-semibold ${muted ? 'text-slate-400' : 'text-slate-800'}`}>{label}</dt>
        <p className="truncate text-[11px] text-slate-500">{hint}</p>
      </div>
      <dd
        className={`shrink-0 tabular-nums ${muted ? 'text-xs text-slate-400' : emphasized ? 'text-base font-semibold text-slate-900' : 'text-sm font-semibold text-slate-800'}`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatPercent(value: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace('%', '').trim());
    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
}

function isDictamenCacheShape(value: unknown): value is DictamenCacheShape {
  return typeof value === 'object' && value !== null;
}

function getClosedFromCacheShape(cached: unknown): boolean {
  if (!isDictamenCacheShape(cached)) return false;

  const readOnly =
    cached.readOnly === true ||
    cached.data?.readOnly === true ||
    cached.dictamen?.readOnly === true ||
    cached.data?.dictamen?.readOnly === true;

  const estado =
    cached.dictamen?.estado ??
    cached.estado ??
    cached.data?.dictamen?.estado ??
    cached.data?.estado ??
    cached.dictamenEstado ??
    cached.data?.dictamenEstado ??
    null;

  return readOnly || estado === 'CERRADO';
}

function setClosedInCachedDictamen(prev: unknown, serverVersion?: string): unknown {
  if (!isDictamenCacheShape(prev) || !prev.dictamen) {
    return prev;
  }

  return {
    ...prev,
    readOnly: true,
    serverVersion: serverVersion ?? prev.serverVersion,
    dictamen: {
      ...prev.dictamen,
      estado: 'CERRADO',
    },
  } satisfies DictamenCacheShape;
}

export default function DictamenRightPanel({
  dictamenId,
  procedimientoPcl,
  readOnly = false,
}: Props) {
  const params = useParams<{ id?: string; Id?: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localClosed, setLocalClosed] = useState(false);

  const idFromParams = useMemo(() => {
    const raw = params.Id ?? params.id ?? null;
    const numericValue = Number(raw);
    return Number.isFinite(numericValue) ? numericValue : null;
  }, [params]);

  const effectiveDictamenId =
    typeof dictamenId === 'number' && Number.isFinite(dictamenId) && dictamenId > 0
      ? dictamenId
      : idFromParams;
  const resolvedDictamenId = effectiveDictamenId ?? 0;

  const panel = useDictamenDeficienciasPanel(resolvedDictamenId, procedimientoPcl ?? null);
  const cerrar = useCerrarDictamen(resolvedDictamenId);
  const { can: canCloseDictamen } = useCan('dictamen.close');
  const { can: canPrintDictamen } = useCan('dictamen.print');

  const panelDictamen: DictamenPanelData['dictamen'] | undefined = panel.data?.dictamen;
  const proc = procedimientoPcl ?? panelDictamen?.procedimientoPcl ?? 'A';
  const max = proc === 'A' ? 75 : 50;

  const [closedFromCache, setClosedFromCache] = useState<boolean>(() => {
    const cached = qc.getQueryData(['dictamen', resolvedDictamenId]);
    return getClosedFromCacheShape(cached);
  });

  useEffect(() => {
    const compute = () => {
      const cached = qc.getQueryData(['dictamen', resolvedDictamenId]);
      const next = getClosedFromCacheShape(cached);
      setClosedFromCache((prev) => (prev === next ? prev : next));
    };

    compute();

    const unsubscribe = qc.getQueryCache().subscribe((event) => {
      // Solo el detalle ['dictamen', id] define si está cerrado. Otras queries con el mismo prefijo
      // (p. ej. ['dictamen', id, 'sustentacion']) se registran durante el render de su componente,
      // y reaccionar a ese evento actualizaría este panel en medio de ese render.
      if (event.type !== 'updated' && event.type !== 'removed') return;
      const queryKey = event.query.queryKey;
      if (queryKey.length === 2 && queryKey[0] === 'dictamen' && Number(queryKey[1]) === resolvedDictamenId) {
        compute();
      }
    });

    const onEstado = (event: Event) => {
      const customEvent = event as CustomEvent<{ dictamenId?: number }>;
      if (customEvent.detail?.dictamenId === resolvedDictamenId) {
        setClosedFromCache(true);
      }
    };

    window.addEventListener('dictamen:closed', onEstado as EventListener);
    window.addEventListener('dictamen:estado_updated', onEstado as EventListener);

    return () => {
      unsubscribe?.();
      window.removeEventListener('dictamen:closed', onEstado as EventListener);
      window.removeEventListener('dictamen:estado_updated', onEstado as EventListener);
    };
  }, [resolvedDictamenId, qc]);

  useEffect(() => {
    function onTotalesUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ dictamenId?: number }>;
      if (customEvent.detail?.dictamenId === resolvedDictamenId) {
        panel.refetch();
      }
    }

    window.addEventListener('dictamen:totales_updated', onTotalesUpdated as EventListener);
    return () => window.removeEventListener('dictamen:totales_updated', onTotalesUpdated as EventListener);
  }, [panel, resolvedDictamenId]);

  if (!effectiveDictamenId) {
    return (
      <div className="h-fit rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Totales</h2>
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          Selecciona o abre un dictamen para ver los totales.
        </div>
      </div>
    );
  }

  const isCerrado = localClosed || closedFromCache || panelDictamen?.estado === 'CERRADO';

  const totalTitulo1Raw = toNumber(panelDictamen?.totalTitulo1);
  const totalTitulo1Label = formatPercent(totalTitulo1Raw == null ? null : Math.round(totalTitulo1Raw));

  const totalCap1Raw = toNumber(panelDictamen?.totalCap1);
  const totalCap1Label =
    proc !== 'B'
      ? 'No aplica'
      : totalCap1Raw == null || Number.isNaN(totalCap1Raw)
        ? '—'
        : `${totalCap1Raw.toFixed(1)}%`;

  const totalCap2Raw = toNumber(panelDictamen?.totalCap2);
  const totalCap2Label = formatPercent(totalCap2Raw);
  const claseCap2 = panelDictamen?.claseLimitacionLaboral ?? null;

  const totalTitulo3Raw = toNumber(panelDictamen?.totalTitulo3);
  const totalTitulo3Label = proc !== 'A' ? 'No aplica' : formatPercent(totalTitulo3Raw);

  const basePcl = (totalTitulo1Raw ?? 0) + (proc === 'B' ? (totalCap1Raw ?? 0) : 0) + (totalCap2Raw ?? 0);
  const pclCalculado = proc === 'A' ? basePcl + (totalTitulo3Raw ?? 0) : basePcl;
  const pclFinal = capPcl(pclCalculado);

  const basePclLabel = formatPercent(basePcl);
  const pclFinalLabel = formatPercent(pclFinal);
  const closingDisabled = readOnly || !canCloseDictamen || isCerrado || cerrar.isPending;

  async function confirmClose() {
    try {
      const response = await cerrar.mutateAsync();
      const maybeServerVersion = response.serverVersion ? String(response.serverVersion) : undefined;

      setLocalClosed(true);
      setConfirmOpen(false);

      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }

      qc.setQueryData(['dictamen', resolvedDictamenId], (prev) =>
        setClosedInCachedDictamen(prev, maybeServerVersion),
      );

      window.dispatchEvent(
        new CustomEvent('dictamen:closed', {
          detail: { dictamenId: resolvedDictamenId, serverVersion: maybeServerVersion },
        }),
      );

      toast.success('Dictamen cerrado', { id: 'dictamen_cerrado_ok' });

      panel.refetch();
      qc.invalidateQueries({ queryKey: ['dictamen', resolvedDictamenId] });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cerrar el dictamen';
      toast.error(message, { id: 'dictamen_cerrado_error' });
    }
  }

  return (
    <>
      <div className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Totales</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              Proc. {proc}
            </span>
            {isCerrado && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                Cerrado
              </span>
            )}
          </div>

          <button
            type="button"
            data-ro-allow="1"
            onClick={() => panel.refetch()}
            aria-label="Refrescar totales"
            title="Refrescar totales"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <RefreshCw
              aria-hidden="true"
              className={`h-3.5 w-3.5 ${panel.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`}
            />
          </button>
        </div>

        {panel.isLoading && (
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
            Cargando totales…
          </div>
        )}

        {panel.isError && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700">
            No se pudo cargar el panel de deficiencias.
          </div>
        )}

        {!panel.isLoading && !panel.isError && (
          <div className="mt-4 space-y-4">
            {/* Result first: what the physician is looking for. */}
            <section
              aria-label="PCL final"
              className="rounded-xl bg-gradient-to-br from-sky-700 to-sky-900 px-4 py-4 text-white shadow-sm"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-sky-100">PCL final</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums">{pclFinalLabel}</p>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20"
                role="progressbar"
                aria-label="PCL final sobre 100%"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pclFinal)}
              >
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${Math.max(0, Math.min(pclFinal, 100))}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-sky-100">
                {proc === 'A' ? 'Base PCL + Título III' : 'Base PCL (sin Título III)'}
              </p>
            </section>

            {/* Breakdown: one compact row per component. */}
            <section aria-label="Desglose">
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Desglose</h3>
              <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                <TotalRow label="Título I" hint={`Deficiencias · máx. ${max}%`} value={totalTitulo1Label} />
                <TotalRow
                  label="Título II · Cap. 1"
                  hint={proc === 'B' ? 'AVD-AIVD' : 'Solo procedimiento B'}
                  value={totalCap1Label}
                  muted={proc !== 'B'}
                />
                <TotalRow
                  label="Título II · Cap. 2"
                  hint={`Limitación laboral · clase ${claseCap2 ?? '—'}`}
                  value={totalCap2Label}
                />
                <TotalRow label="Base PCL" hint="T I + T II" value={basePclLabel} emphasized />
                <TotalRow
                  label="Título III"
                  hint={proc === 'A' ? 'Análisis ocupacional · incremento' : 'Solo procedimiento A'}
                  value={proc === 'A' && totalTitulo3Raw != null ? `+${totalTitulo3Label}` : totalTitulo3Label}
                  muted={proc !== 'A'}
                />
              </dl>
            </section>

            {/* Actions: neutral card; only closing is destructive. */}
            <section aria-label="Acciones" className="space-y-2 border-t border-slate-100 pt-4">
              {readOnly ? (
                <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                  <Lock aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Solo lectura: este dictamen no puede cerrarse desde esta vista.
                </p>
              ) : null}

              {canPrintDictamen ? (
                <button
                  type="button"
                  onClick={() => onPrintReactPdf(effectiveDictamenId)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <Printer aria-hidden="true" className="h-4 w-4" />
                  Imprimir PDF
                </button>
              ) : null}

              {!readOnly && canCloseDictamen && (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={closingDisabled}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                      closingDisabled
                        ? 'cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400'
                        : 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                    }`}
                  >
                    <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                    {cerrar.isPending ? 'Cerrando…' : isCerrado ? 'Dictamen cerrado' : 'Cerrar dictamen'}
                  </button>
                  {!isCerrado ? (
                    <p className="text-center text-[11px] text-slate-500">Al cerrarlo quedará bloqueado para edición.</p>
                  ) : null}
                </>
              )}
            </section>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmClose}
        loading={cerrar.isPending}
        danger
        title="Cerrar dictamen"
        description={
          <>
            ¿Seguro que deseas <b>CERRAR</b> este dictamen?
            <br />
            <span className="font-semibold text-red-700">Una vez cerrado no se podra editar.</span>
          </>
        }
        cancelText="Cancelar"
        confirmText="Si, cerrar"
      />
    </>
  );
}
