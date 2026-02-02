'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useDictamenDeficienciasPanel } from '@/hooks/useDictamenDeficienciasPanel';
import { useCerrarDictamen } from '@/hooks/useCerrarDictamen';
import ConfirmModal from '@/components/ui/ConfirmModal';

type Props = {
  dictamenId?: number;
  procedimientoPcl?: 'A' | 'B';
};

function formatPercent(value: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export default function DictamenRightPanel({ dictamenId, procedimientoPcl }: Props) {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localClosed, setLocalClosed] = useState(false);

  const idFromParams = useMemo(() => {
    const raw = (params as any)?.id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const effectiveDictamenId =
    Number.isFinite(dictamenId as number) && (dictamenId as number) > 0
      ? (dictamenId as number)
      : idFromParams;

  if (!effectiveDictamenId) {
    return (
      <div className="p-4 bg-white border shadow-sm rounded-xl h-fit">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
          Totales
        </h2>

        <div className="px-3 py-3 mt-3 text-xs border rounded-md border-slate-200 bg-slate-50 text-slate-600">
          Selecciona/abre un dictamen para ver los totales.
        </div>
      </div>
    );
  }

  const panel = useDictamenDeficienciasPanel(effectiveDictamenId, procedimientoPcl ?? null);
  const cerrar = useCerrarDictamen(effectiveDictamenId);

  const proc = (procedimientoPcl ?? panel.data?.dictamen?.procedimientoPcl ?? 'A') as 'A' | 'B';
  const max = proc === 'A' ? 75 : 50;

  const totalTitulo1Raw =
    panel.data?.dictamen?.totalTitulo1 == null ? null : Number(panel.data.dictamen.totalTitulo1);
  const totalTitulo1Label = formatPercent(
    totalTitulo1Raw == null ? null : Math.round(totalTitulo1Raw)
  );

  const totalCap1Raw =
    panel.data?.dictamen?.totalCap1 == null ? null : Number(panel.data.dictamen.totalCap1);

  const totalCap1Label =
    proc !== 'B'
      ? 'No aplica'
      : totalCap1Raw == null || Number.isNaN(totalCap1Raw)
      ? '—'
      : `${totalCap1Raw.toFixed(1)}%`;

  const totalCap2Raw =
    panel.data?.dictamen?.totalCap2 == null ? null : Number(panel.data.dictamen.totalCap2);
  const totalCap2Label = formatPercent(totalCap2Raw);

  const claseCap2 =
    (panel.data?.dictamen as any)?.claseLimitacionLaboral == null
      ? null
      : String((panel.data?.dictamen as any).claseLimitacionLaboral);

  const totalTitulo3Raw =
    (panel.data?.dictamen as any)?.totalTitulo3 == null
      ? null
      : Number((panel.data?.dictamen as any).totalTitulo3);

  const totalTitulo3Label = proc !== 'A' ? 'No aplica' : formatPercent(totalTitulo3Raw);

  const basePcl =
    (totalTitulo1Raw ?? 0) + (proc === 'B' ? (totalCap1Raw ?? 0) : 0) + (totalCap2Raw ?? 0);

  const pclFinal = proc === 'A' ? basePcl + (totalTitulo3Raw ?? 0) : basePcl;

  const basePclLabel = formatPercent(basePcl);
  const pclFinalLabel = formatPercent(pclFinal);

  useEffect(() => {
    function onTotalesUpdated(ev: Event) {
      const e = ev as CustomEvent<{ dictamenId?: number }>;
      if (e?.detail?.dictamenId === effectiveDictamenId) {
        panel.refetch();
      }
    }

    window.addEventListener('dictamen:totales_updated', onTotalesUpdated as any);
    return () => {
      window.removeEventListener('dictamen:totales_updated', onTotalesUpdated as any);
    };
  }, [effectiveDictamenId, panel]);

  const closingDisabled = localClosed || cerrar.isPending;

  async function confirmClose() {
    try {
      await cerrar.mutateAsync();
      setLocalClosed(true);
      setConfirmOpen(false);

      toast.success('Dictamen cerrado', { id: 'dictamen_cerrado_ok' });

      panel.refetch();
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? 'No se pudo cerrar el dictamen', {
        id: 'dictamen_cerrado_error',
      });
    }
  }

  return (
    <>
      <div className="p-4 bg-white border shadow-sm rounded-xl h-fit">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Totales
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Procedimiento actual:{' '}
              <span className="font-semibold text-slate-700">{proc}</span>
            </p>

            {localClosed && (
              <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                Dictamen CERRADO
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => panel.refetch()}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refrescar
          </button>
        </div>

        {panel.isLoading && (
          <div className="px-3 py-3 mt-3 text-xs border rounded-md border-slate-200 bg-slate-50 text-slate-600">
            Cargando totales…
          </div>
        )}

        {panel.isError && (
          <div className="px-3 py-3 mt-3 text-xs text-red-700 border border-red-200 rounded-md bg-red-50">
            No se pudo cargar el panel de deficiencias.
          </div>
        )}

        {!panel.isLoading && !panel.isError && (
          <div className="mt-3 space-y-2">
            <div className="px-3 py-3 bg-white border rounded-md border-slate-200">
              <p className="text-[11px] text-slate-500">Total Título I</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{totalTitulo1Label}</p>
                <p className="text-[11px] text-slate-500">
                  (Proc. {proc} · máx {max}%)
                </p>
              </div>
            </div>

            <div className="px-3 py-3 bg-white border rounded-md border-slate-200">
              <p className="text-[11px] text-slate-500">Total Cap. 1 (AVD–AIVD)</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{totalCap1Label}</p>
                <p className="text-[11px] text-slate-500">
                  {proc === 'B' ? 'Suma de actividades' : '(Solo Proc. B)'}
                </p>
              </div>
            </div>

            <div className="px-3 py-3 bg-white border rounded-md border-slate-200">
              <p className="text-[11px] text-slate-500">Total Cap. 2 (Limitación laboral)</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{totalCap2Label}</p>
                <p className="text-[11px] text-slate-500">
                  Clase: <span className="font-semibold text-slate-700">{claseCap2 ?? '—'}</span>
                </p>
              </div>
            </div>

            <div className="px-3 py-3 bg-white border rounded-md border-slate-200">
              <p className="text-[11px] text-slate-500">Total Título III (Análisis ocupacional)</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{totalTitulo3Label}</p>
                <p className="text-[11px] text-slate-500">
                  {proc === 'A' ? 'Incremento sobre Base PCL' : '(Solo Proc. A)'}
                </p>
              </div>
            </div>

            <div className="px-3 py-3 border rounded-md bg-slate-50 border-slate-200">
              <p className="text-[11px] text-slate-500">Total Base PCL (T1 + T2)</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-slate-900">{basePclLabel}</p>
                <p className="text-[11px] text-slate-500">
                  {proc === 'A' ? 'Sin Título III' : 'Total acumulado'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200">
                <p className="text-[11px] text-slate-500">PCL Final</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-slate-900">{pclFinalLabel}</p>
                  <p className="text-[11px] text-slate-500">
                    {proc === 'A' ? 'Base + Título III' : 'No aplica Título III'}
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ Zona de peligro - abajo */}
            <div className="px-3 py-3 mt-4 border border-red-200 rounded-md bg-red-50">
              <p className="text-[11px] font-semibold text-red-800">Acciones</p>
              <p className="mt-1 text-[11px] text-red-700">
                Al cerrar el dictamen, quedará bloqueado para edición.
              </p>

              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={closingDisabled}
                className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold border ${
                  closingDisabled
                    ? 'cursor-not-allowed border-slate-200 bg-white text-slate-400'
                    : 'border-red-300 bg-white text-red-700 hover:bg-red-100'
                }`}
              >
                {cerrar.isPending ? 'Cerrando…' : 'Cerrar dictamen'}
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
            <span className="font-semibold text-red-700">
              Una vez cerrado no se podrá editar.
            </span>
          </>
        }
        cancelText="Cancelar"
        confirmText="Sí, cerrar"
      />
    </>
  );
}
