'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMedicoAccess } from '@/components/medico/MedicoAccessProvider';
import { useDictamenDeficienciasPanel } from '@/hooks/useDictamenDeficienciasPanel';
import {
  CLASES_CAP2,
  ClaseLimitacionLaboral,
  getTotalCap2,
  ProcedimientoPcl,
} from '@/lib/dictamen/capitulo2';

type Props = {
  dictamenId: number;
  procedimientoPcl: ProcedimientoPcl; // 'A' | 'B'
  initialClase?: ClaseLimitacionLaboral | null;
  initialTotal?: number | null;
};

type TotalesPcl = {
  totalTitulo1: number; // lo mantiene TabDeficiencias/RightPanel
  totalCap2: number; // lo actualiza este tab
};

function toNum(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof v === 'object' && typeof v?.toString === 'function') {
    const n = Number(String(v.toString()));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function TituloIICapitulo2Tab({
  dictamenId,
  procedimientoPcl,
  initialClase = null,
}: Props) {
  const { readOnly } = useMedicoAccess();
  const queryClient = useQueryClient();

  // ✅ cache compartida con RightPanel
  const panel = useDictamenDeficienciasPanel(dictamenId, procedimientoPcl);

  // Estado local (UI inmediata)
  const [clase, setClase] = useState<ClaseLimitacionLaboral | null>(initialClase);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const totalesKey = useMemo(() => ['dictamen', dictamenId, 'totales'] as const, [dictamenId]);

  // ✅ Rehidrata clase desde servidor (cuando cambia por refetch)
  useEffect(() => {
    if (!panel.isSuccess) return;

    const serverClase =
      (panel.data?.dictamen?.claseLimitacionLaboral as ClaseLimitacionLaboral | null | undefined) ??
      null;

    setClase((prev) => (prev === serverClase ? prev : serverClase));
  }, [panel.isSuccess, panel.data?.dictamen?.claseLimitacionLaboral]);

  // ✅ IMPORTANTÍSIMO:
  // cada vez que el panel traiga totales desde BD, sincronizamos el cache ['dictamen', id, 'totales']
  // para que CenterPanel tenga valores correctos incluso antes de editar.
  useEffect(() => {
    if (!panel.isSuccess) return;

    const serverT1 = toNum(panel.data?.dictamen?.totalTitulo1);
    const serverCap2 = toNum(panel.data?.dictamen?.totalCap2);

    queryClient.setQueryData<TotalesPcl>(totalesKey, (prev) => ({
      totalTitulo1: Number.isFinite(serverT1) ? serverT1 : prev?.totalTitulo1 ?? 0,
      totalCap2: Number.isFinite(serverCap2) ? serverCap2 : prev?.totalCap2 ?? 0,
    }));
  }, [
    panel.isSuccess,
    panel.data?.dictamen?.totalTitulo1,
    panel.data?.dictamen?.totalCap2,
    queryClient,
    totalesKey,
  ]);

  // Total calculado SIEMPRE desde helper (según procedimiento y clase)
  const total = useMemo(() => getTotalCap2(procedimientoPcl, clase), [procedimientoPcl, clase]);

  // Mensaje inline tipo “toast”
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2500);
    return () => clearTimeout(t);
  }, [msg]);

  const saveCap2 = async (
    newClase: ClaseLimitacionLaboral | null,
    prevClase: ClaseLimitacionLaboral | null,
    newTotalCap2: number,
  ) => {
    if (!dictamenId) return;

    // ✅ optimistic update del cache compartido (INMEDIATO)
    const prevTotales = queryClient.getQueryData<TotalesPcl>(totalesKey);

    queryClient.setQueryData<TotalesPcl>(totalesKey, (prev) => ({
      totalTitulo1: prev?.totalTitulo1 ?? prevTotales?.totalTitulo1 ?? 0,
      totalCap2: newTotalCap2,
    }));

    setSaving(true);
    try {
      const res = await fetch(`/api/dictamenes/${dictamenId}/capitulo2`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          claseLimitacionLaboral: newClase,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Error guardando Capítulo 2');
      }

      // ✅ Refresca RightPanel y este tab (consumen el mismo query)
      await queryClient.invalidateQueries({
        queryKey: ['dictamen-deficiencias-panel', dictamenId],
        exact: false,
      });

      setMsg('Guardado');
    } catch (e: any) {
      console.error(e);

      // ✅ rollback UI + rollback cache compartido
      setClase(prevClase);

      if (prevTotales) {
        queryClient.setQueryData<TotalesPcl>(totalesKey, prevTotales);
      }

      setMsg(e?.message ?? 'Error guardando');
    } finally {
      setSaving(false);
    }
  };

  const onSelectClase = async (c: ClaseLimitacionLaboral) => {
    if (readOnly) return;

    const prevClase = clase;

    // UI inmediata
    setClase(c);

    const newTotalCap2 = toNum(getTotalCap2(procedimientoPcl, c));
    await saveCap2(c, prevClase, newTotalCap2);
  };

  const isA = procedimientoPcl === 'A';
  const isB = procedimientoPcl === 'B';

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
        <div>
          <h3 className="text-sm font-semibold">Título II - Capítulo 2</h3>
          <p className="text-xs text-gray-500">
            Selecciona una clase. El valor se calcula según el procedimiento {procedimientoPcl}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saving ? (
            <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-700">
              Guardando…
            </span>
          ) : msg ? (
            <span className="px-2 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700">
              {msg}
            </span>
          ) : null}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden bg-white border rounded-lg">
        <div className="grid grid-cols-4 text-xs font-semibold border-b bg-slate-50 text-slate-700">
          <div className="p-3">CLASE</div>
          <div className="p-3">Criterio 1: Limitaciones en el perfil laboral</div>
          <div className={`p-3 text-center ${isA ? 'bg-blue-50 text-blue-700' : ''}`}>A</div>
          <div className={`p-3 text-center ${isB ? 'bg-blue-50 text-blue-700' : ''}`}>B</div>
        </div>

        {CLASES_CAP2.map((row) => {
          const checked = clase === row.clase;

          return (
            <label
              key={row.clase}
              className={`grid cursor-pointer grid-cols-4 items-center border-b text-sm last:border-b-0 ${
                checked ? 'bg-blue-50/40' : 'bg-white'
              } ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <div className="flex items-center gap-2 p-3">
                <input
                  type="radio"
                  name="claseCap2"
                  checked={checked}
                  disabled={readOnly}
                  onChange={() => onSelectClase(row.clase)}
                />
                <span className="font-semibold">{row.clase}</span>
              </div>

              <div className="p-3 text-gray-800">{row.label}</div>

              <div className={`p-3 text-center ${isA ? 'font-semibold text-blue-700' : ''}`}>
                {row.A}%
              </div>
              <div className={`p-3 text-center ${isB ? 'font-semibold text-blue-700' : ''}`}>
                {row.B}%
              </div>
            </label>
          );
        })}

        {/* Total */}
        <div className="grid grid-cols-4 bg-white">
          <div className="col-span-2 p-3 text-sm font-semibold">VALOR TOTAL</div>
          <div className="col-span-2 p-3 text-sm font-semibold text-right">
            {total == null ? '—' : `${total}%`}
          </div>
        </div>
      </div>
    </div>
  );
}