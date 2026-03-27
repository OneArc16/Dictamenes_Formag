'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import {
  useDictamenDeficienciasPanel,
  type DictamenPanelData,
} from '@/hooks/useDictamenDeficienciasPanel';
import { useCerrarDictamen } from '@/hooks/useCerrarDictamen';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { DictamenUltimaReapertura } from '@/components/dictamen/types';

type Props = {
  dictamenId?: number;
  procedimientoPcl?: 'A' | 'B';
  readOnly?: boolean;
  ultimaReapertura?: DictamenUltimaReapertura | null;
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
  ultimaReapertura = null,
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
      const queryKey = event?.query?.queryKey;
      if (Array.isArray(queryKey) && queryKey[0] === 'dictamen' && Number(queryKey[1]) === resolvedDictamenId) {
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
  const pclFinal = proc === 'A' ? basePcl + (totalTitulo3Raw ?? 0) : basePcl;

  const basePclLabel = formatPercent(basePcl);
  const pclFinalLabel = formatPercent(pclFinal);
  const closingDisabled = readOnly || isCerrado || cerrar.isPending;

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
      <div className="h-fit rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Totales</h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Procedimiento actual: <span className="font-semibold text-slate-700">{proc}</span>
            </p>

            {isCerrado && (
              <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                Dictamen cerrado
              </div>
            )}
          </div>

          <button
            type="button"
            data-ro-allow="1"
            onClick={() => panel.refetch()}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refrescar
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
          <div className="mt-3 space-y-2">
            <div className="rounded-md border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] text-slate-500">Total Titulo I</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{totalTitulo1Label}</p>
                <p className="text-[11px] text-slate-500">(Proc. {proc} · max {max}%)</p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] text-slate-500">Total Cap. 1 (AVD-AIVD)</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{totalCap1Label}</p>
                <p className="text-[11px] text-slate-500">
                  {proc === 'B' ? 'Suma de actividades' : '(Solo Proc. B)'}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] text-slate-500">Total Cap. 2 (Limitacion laboral)</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{totalCap2Label}</p>
                <p className="text-[11px] text-slate-500">
                  Clase: <span className="font-semibold text-slate-700">{claseCap2 ?? '—'}</span>
                </p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] text-slate-500">Total Titulo III (Analisis ocupacional)</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{totalTitulo3Label}</p>
                <p className="text-[11px] text-slate-500">
                  {proc === 'A' ? 'Incremento sobre Base PCL' : '(Solo Proc. A)'}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="text-[11px] text-slate-500">Total Base PCL (T1 + T2)</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{basePclLabel}</p>
                <p className="text-[11px] text-slate-500">
                  {proc === 'A' ? 'Sin Titulo III' : 'Total acumulado'}
                </p>
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3">
                <p className="text-[11px] text-slate-500">PCL Final</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-slate-900">{pclFinalLabel}</p>
                  <p className="text-[11px] text-slate-500">
                    {proc === 'A' ? 'Base + Titulo III' : 'No aplica Titulo III'}
                  </p>
                </div>
              </div>
            </div>

            {ultimaReapertura ? (
              <div className="rounded-md border border-sky-100 bg-sky-50 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                  Ultima reapertura
                </p>
                <p className="mt-1 text-sm font-semibold text-sky-900">{ultimaReapertura.actorNombre}</p>
                <p className="mt-1 text-[11px] text-sky-700">{formatDateTime(ultimaReapertura.createdAt)}</p>
                {ultimaReapertura.motivoReapertura ? (
                  <p className="mt-2 text-xs leading-5 text-sky-900">
                    Motivo: {ultimaReapertura.motivoReapertura}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-3">
              <p className="text-[11px] font-semibold text-red-800">Acciones</p>
              <p className="mt-1 text-[11px] text-red-700">
                {readOnly
                  ? 'Este dictamen esta en modo solo lectura y no puede cerrarse desde esta vista.'
                  : 'Al cerrar el dictamen, quedara bloqueado para edicion.'}
              </p>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={closingDisabled}
                  className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
                    closingDisabled
                      ? 'cursor-not-allowed border-slate-200 bg-white text-slate-400'
                      : 'border-red-300 bg-white text-red-700 hover:bg-red-100'
                  }`}
                >
                  {cerrar.isPending ? 'Cerrando…' : isCerrado ? 'Dictamen cerrado' : 'Cerrar dictamen'}
                </button>
              )}

              <button
                type="button"
                onClick={() => onPrintReactPdf(effectiveDictamenId)}
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Imprimir PDF
              </button>
            </div>
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
