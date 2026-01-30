// src/components/dictamen/DictamenRightPanel.tsx
'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useDictamenDeficienciasPanel } from '@/hooks/useDictamenDeficienciasPanel';

type Props = {
  dictamenId?: number;
  procedimientoPcl?: 'A' | 'B';
};

function formatPercent(value: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  // si viene 35 -> 35% / si viene 35.5 -> 35.5%
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export default function DictamenRightPanel({ dictamenId, procedimientoPcl }: Props) {
  const params = useParams<{ id: string }>();

  const idFromParams = useMemo(() => {
    const raw = (params as any)?.id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const effectiveDictamenId =
    Number.isFinite(dictamenId as number) && (dictamenId as number) > 0
      ? (dictamenId as number)
      : idFromParams;

  // ⛔ si no hay id válido, mostramos el placeholder
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

  const proc = (procedimientoPcl ??
    panel.data?.dictamen?.procedimientoPcl ??
    'A') as 'A' | 'B';

  const max = proc === 'A' ? 75 : 50;

  // ✅ Total Título I
  const totalTitulo1 =
    panel.data?.dictamen?.totalTitulo1 == null ? null : Number(panel.data.dictamen.totalTitulo1);

  const totalTitulo1Label = formatPercent(
    totalTitulo1 == null ? null : Math.round(totalTitulo1),
  );

  // ✅ Capítulo 1 (AVD-AIVD) - solo Proc B
  const totalCap1Raw =
    panel.data?.dictamen?.totalCap1 == null ? null : Number(panel.data.dictamen.totalCap1);

  const totalCap1Label =
    proc !== 'B'
      ? 'No aplica'
      : totalCap1Raw == null || Number.isNaN(totalCap1Raw)
      ? '—'
      : totalCap1Raw.toFixed(1);

  // ✅ NUEVO: Capítulo 2 (Limitación laboral) - aplica A y B
  const totalCap2Raw =
    panel.data?.dictamen?.totalCap2 == null ? null : Number(panel.data.dictamen.totalCap2);

  const totalCap2Label = formatPercent(totalCap2Raw);

  const claseCap2 =
    (panel.data?.dictamen as any)?.claseLimitacionLaboral == null
      ? null
      : String((panel.data?.dictamen as any).claseLimitacionLaboral);

  // ✅ Refresco automático (igual que antes)
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

  return (
    <div className="p-4 bg-white border shadow-sm rounded-xl h-fit">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
            Totales
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Procedimiento actual: <span className="font-semibold text-slate-700">{proc}</span>
          </p>
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
          {/* ✅ ORDEN CORRECTO: 1) Título I */}
          <div className="px-3 py-3 bg-white border rounded-md border-slate-200">
            <p className="text-[11px] text-slate-500">Total Título I</p>
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-semibold text-slate-900">{totalTitulo1Label}</p>
              <p className="text-[11px] text-slate-500">
                (Proc. {proc} · máx {max}%)
              </p>
            </div>
          </div>

          {/* ✅ 2) Capítulo 1 */}
          <div className="px-3 py-3 bg-white border rounded-md border-slate-200">
            <p className="text-[11px] text-slate-500">Total Cap. 1 (AVD–AIVD)</p>
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-semibold text-slate-900">{totalCap1Label}</p>
              <p className="text-[11px] text-slate-500">
                {proc === 'B' ? 'Suma de actividades' : '(Solo Proc. B)'}
              </p>
            </div>
          </div>

          {/* ✅ 3) Capítulo 2 */}
          <div className="px-3 py-3 bg-white border rounded-md border-slate-200">
            <p className="text-[11px] text-slate-500">Total Cap. 2 (Limitación laboral)</p>
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-semibold text-slate-900">{totalCap2Label}</p>
              <p className="text-[11px] text-slate-500">
                Clase: <span className="font-semibold text-slate-700">{claseCap2 ?? '—'}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
