'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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

  // ✅ NUEVO: ya no depende de provider
  readOnly?: boolean;
};

export function TituloIICapitulo2Tab({
  dictamenId,
  procedimientoPcl,
  initialClase = null,
  readOnly = false,
}: Props) {
  const queryClient = useQueryClient();

  // ✅ Cache compartida con RightPanel
  const panel = useDictamenDeficienciasPanel(dictamenId, procedimientoPcl);

  const [clase, setClase] = useState<ClaseLimitacionLaboral | null>(initialClase);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!panel.isSuccess) return;

    const serverClase =
      (panel.data?.dictamen?.claseLimitacionLaboral as ClaseLimitacionLaboral | null | undefined) ??
      null;

    setClase((prev) => (prev === serverClase ? prev : serverClase));
  }, [panel.isSuccess, panel.data?.dictamen?.claseLimitacionLaboral]);

  const total = useMemo(() => getTotalCap2(procedimientoPcl, clase), [procedimientoPcl, clase]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2500);
    return () => clearTimeout(t);
  }, [msg]);

  const saveCap2 = async (newClase: ClaseLimitacionLaboral | null) => {
    if (!dictamenId) return;

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

      await queryClient.invalidateQueries({
        queryKey: ['dictamen-deficiencias-panel', dictamenId],
        exact: false,
      });

      setMsg('Guardado');
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message ?? 'Error guardando');
    } finally {
      setSaving(false);
    }
  };

  const onSelectClase = async (c: ClaseLimitacionLaboral) => {
    if (readOnly) return;
    setClase(c);
    await saveCap2(c);
  };

  const isA = procedimientoPcl === 'A';
  const isB = procedimientoPcl === 'B';

  return (
    <div className="space-y-4">
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