'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  useDiagnosticosDraft,
  DiagnosticoRowDraft,
  TipoDiagnosticoLocal,
} from '@/hooks/useDiagnosticosDraft';

import {
  SearchableSelect,
  SearchableOption,
} from '@/components/forms/SearchableSelect';

type ProcedimientoPcl = 'A' | 'B';

type Props = {
  dictamenId: number;
  procedimientoPcl: ProcedimientoPcl;
  /** Lista de CIE10: value = código, label = "código - nombre" */
  cie10Options: SearchableOption[];
};

const TIPO_DIAGNOSTICO_OPTIONS: { value: TipoDiagnosticoLocal; label: string }[] =
  [
    { value: 'CONFIRMADO_NUEVO', label: 'Confirmado nuevo' },
    { value: 'IMPRESION_DIAGNOSTICA', label: 'Impresión diagnóstica' },
    { value: 'CONFIRMADO_REPETIDO', label: 'Confirmado repetido' },
  ];

export default function TabDiagnosticos({
  dictamenId,
  procedimientoPcl,
  cie10Options,
}: Props) {
  const {
    diagnosticos,
    setDiagnosticos,
    loaded,
    saving: savingDraft,
  } = useDiagnosticosDraft(dictamenId);

  const [savingRemote, setSavingRemote] = useState(false);

  // Al cargar por primera vez, si no hay nada en el borrador,
  // generamos las 5 filas iniciales
  useEffect(() => {
    if (!loaded) return;
    if (diagnosticos.length > 0) return;

    const now = Date.now();
    const iniciales: DiagnosticoRowDraft[] = Array.from({ length: 5 }).map(
      (_, idx) => ({
        id: `row-${idx + 1}-${now}`,
        tipo: 'IMPRESION_DIAGNOSTICA',
      })
    );

    setDiagnosticos(iniciales);
  }, [loaded, diagnosticos.length, setDiagnosticos]);

  const handleRowChange = (
    index: number,
    patch: Partial<DiagnosticoRowDraft>
  ) => {
    const rows = [...diagnosticos];
    rows[index] = { ...rows[index], ...patch };
    setDiagnosticos(rows);
  };

  const handleAddRow = () => {
    const rows = [
      ...diagnosticos,
      {
        id: `row-${diagnosticos.length + 1}-${Date.now()}`,
        tipo: 'IMPRESION_DIAGNOSTICA' as TipoDiagnosticoLocal,
      },
    ];
    setDiagnosticos(rows);
  };

  const handleRemoveRow = (index: number) => {
    if (diagnosticos.length <= 1) return;
    const rows = [...diagnosticos];
    rows.splice(index, 1);
    setDiagnosticos(rows);
  };

  const handleSaveRemote = async () => {
    const payload = diagnosticos
      .filter((r) => r.cie10Codigo && r.cie10Codigo.trim() !== '')
      .map((r) => ({
        cie10Codigo: r.cie10Codigo!.trim(),
        tipo: r.tipo, // mismo nombre que el enum de Prisma
      }));

    if (payload.length === 0) {
      toast.error('Debes registrar al menos un diagnóstico con CIE10.');
      return;
    }

    try {
      setSavingRemote(true);

      const res = await fetch(
        `/api/dictamenes/${dictamenId}/diagnosticos`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diagnosticos: payload }),
        }
      );

      if (!res.ok) {
        let msg = 'No se pudo guardar los diagnósticos.';
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      toast.success('Diagnósticos guardados correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar los diagnósticos.');
    } finally {
      setSavingRemote(false);
    }
  };

  return (
    <div className="space-y-4 text-xs text-slate-700">
      <div className="flex items-center justify-between px-3 py-2 border rounded-md border-slate-200 bg-slate-50">
        <p className="text-[11px] text-slate-500">
          Registre los diagnósticos CIE10 del dictamen{' '}
          <span className="font-semibold text-slate-700">
            #{dictamenId}
          </span>{' '}
          (procedimiento {procedimientoPcl}).
        </p>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {savingDraft && <span>Guardando borrador…</span>}
          {savingRemote && <span>Guardando en servidor…</span>}
        </div>
      </div>

      {/* Encabezado */}
      <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] items-center gap-2 border-b border-slate-200 pb-2 text-[11px] font-semibold text-slate-500">
        <div>Diagnóstico (CIE10)</div>
        <div>Tipo de diagnóstico</div>
        <div className="text-center">Opciones</div>
      </div>

      {/* Filas */}
      <div className="space-y-3">
        {diagnosticos.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] items-start gap-2"
          >
            {/* CIE10 */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-500">
                Diagnóstico {index + 1}
              </label>
              <SearchableSelect
                value={row.cie10Codigo ?? ''}
                options={cie10Options}
                placeholder="Buscar por código o nombre CIE10…"
                onChange={(value, option) =>
                  handleRowChange(index, {
                    cie10Codigo: value || undefined,
                    cie10Label: option?.label,
                  })
                }
              />
            </div>

            {/* Tipo de diagnóstico */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-500">
                Tipo de diagnóstico
              </label>
              <select
                className="w-full h-8 px-2 text-xs transition bg-white border rounded-md shadow-sm outline-none border-slate-300 text-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                value={row.tipo}
                onChange={(e) =>
                  handleRowChange(index, {
                    tipo: e.target.value as TipoDiagnosticoLocal,
                  })
                }
              >
                {TIPO_DIAGNOSTICO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quitar */}
            <div className="flex items-center justify-center pt-6">
              <button
                type="button"
                className="rounded-full border border-slate-300 px-2 py-1 text-[11px] text-slate-500 transition hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => handleRemoveRow(index)}
                disabled={diagnosticos.length <= 1}
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botones */}
      <div className="flex items-center justify-between pt-3">
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-sky-400 bg-sky-50 px-3 py-1.5 text-[11px] font-medium text-sky-700 transition hover:bg-sky-100"
        >
          <span className="text-base leading-none">＋</span>
          Agregar diagnóstico
        </button>

        <button
          type="button"
          onClick={handleSaveRemote}
          disabled={savingRemote || !loaded}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          Guardar diagnósticos
        </button>
      </div>
    </div>
  );
}
