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

import { useCie10Search } from '@/hooks/useCie10Search';

type ProcedimientoPcl = 'A' | 'B';

type InitialDiagnostico = {
  cie10Codigo: string;
  tipo: TipoDiagnosticoLocal;
};

type Props = {
  dictamenId: number;
  procedimientoPcl: ProcedimientoPcl;
  /** Lista de CIE10 (ya no la usamos para el combo, pero la dejo opcional por compatibilidad) */
  cie10Options?: SearchableOption[];
  /** Diagnósticos que ya existen en la BD (para precargar) */
  initialDiagnosticos?: InitialDiagnostico[];
};

const TIPO_DIAGNOSTICO_OPTIONS: {
  value: TipoDiagnosticoLocal;
  label: string;
}[] = [
  { value: 'CONFIRMADO_NUEVO', label: 'Confirmado nuevo' },
  { value: 'IMPRESION_DIAGNOSTICA', label: 'Impresión diagnóstica' },
  { value: 'CONFIRMADO_REPETIDO', label: 'Confirmado repetido' },
];

export default function TabDiagnosticos({
  dictamenId,
  procedimientoPcl,
  cie10Options, // ya no se usa en el combo, solo lo dejo por si luego lo necesitas
  initialDiagnosticos,
}: Props) {
  const {
    diagnosticos,
    setDiagnosticos,
    loaded,
    saving: savingDraft,
  } = useDiagnosticosDraft(dictamenId);

  const [savingRemote, setSavingRemote] = useState(false);

  // 🔎 Búsqueda remota CIE10 (con mínimo 3 caracteres y debounce)
  const {
    options: cie10SearchOptions,
    loading: cie10Loading,
    error: cie10Error,
    search: searchCie10,
  } = useCie10Search();

  // Al cargar por primera vez:
  // 1) Si hay diagnósticos en BD, los usamos.
  // 2) Si no hay, generamos 5 filas vacías.
  useEffect(() => {
    if (!loaded) return;
    if (diagnosticos.length > 0) return;

    const now = Date.now();

    if (initialDiagnosticos && initialDiagnosticos.length > 0) {
      const rowsFromDb: DiagnosticoRowDraft[] =
        initialDiagnosticos.map((dx, idx) => ({
          id: `row-db-${idx + 1}-${now}`,
          cie10Codigo: dx.cie10Codigo,
          // El label lo podremos volver a recuperar cuando el médico busque de nuevo;
          // por ahora guardamos al menos el código.
          cie10Label: dx.cie10Codigo,
          tipo: dx.tipo,
        }));
      setDiagnosticos(rowsFromDb);
      return;
    }

    const iniciales: DiagnosticoRowDraft[] = Array.from({ length: 5 }).map(
      (_, idx) => ({
        id: `row-${idx + 1}-${now}`,
        tipo: 'IMPRESION_DIAGNOSTICA',
      }),
    );

    setDiagnosticos(iniciales);
  }, [loaded, diagnosticos.length, setDiagnosticos, initialDiagnosticos]);

  const handleRowChange = (
    index: number,
    patch: Partial<DiagnosticoRowDraft>,
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
    // 🔴 Validación específica del diagnóstico principal (fila 1)
    const first = diagnosticos[0];

    if (!first || !first.cie10Codigo || first.cie10Codigo.trim() === '') {
      setPrimaryError(true);
      toast.error(
        'Debes colocar el Diagnóstico principal.',
      );
      return;
    }

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
        },
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

      {cie10Error && (
        <div className="px-3 py-2 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-md">
          {cie10Error}
        </div>
      )}

      {/* Encabezado */}
      <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] items-center gap-2 border-b border-slate-200 pb-2 text-[11px] font-semibold text-slate-500">
        <div>Diagnóstico (CIE10)</div>
        <div>Tipo de diagnóstico</div>
        <div className="text-center">Opciones</div>
      </div>

      {/* Filas */}
      <div className="space-y-3">
        {diagnosticos.map((row, index) => {
          const isPrimary = index === 0;
          const showPrimaryError =
            isPrimary &&
            primaryError &&
            (!row.cie10Codigo || row.cie10Codigo.trim() === '');

          return (
            <div
              key={row.id}
              className={`grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] items-start gap-2 ${
                showPrimaryError ? 'rounded-md bg-red-50/40 p-2' : ''
              }`}
            >
              {/* CIE10 */}
              <div className="flex flex-col gap-1">
                <label
                  className={`text-[11px] ${
                    showPrimaryError
                      ? 'text-red-600 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  Diagnóstico {index + 1}
                  {isPrimary && ' (principal)'}
                </label>
                <div
                  className={
                    showPrimaryError
                      ? 'rounded-md border border-red-400 p-[2px]'
                      : ''
                  }
                >
                  <SearchableSelect
                    value={row.cie10Codigo ?? ''}
                    options={cie10SearchOptions}
                    placeholder="Buscar por código o nombre CIE10…"
                    onChange={(value, option) =>
                      handleRowChange(index, {
                        cie10Codigo: value || undefined,
                        cie10Label: option?.label,
                      })
                    }
                    onSearch={searchCie10}
                    loading={cie10Loading}
                    minChars={3}
                  />
                </div>
                {showPrimaryError && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Debes colocar el diagnóstico principal.
                  </p>
                )}
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
          className="inline-flex.items-center.gap-1.rounded-md.border.border-dashed.border-sky-400.bg-sky-50.px-3.py-1.5.text-[11px].font-medium.text-sky-700.transition.hover:bg-sky-100"
        >
          <span className="text-base leading-none">＋</span>
          Agregar diagnóstico
        </button>

        <button
          type="button"
          onClick={handleSaveRemote}
          disabled={savingRemote || !loaded}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700.disabled:opacity-60"
        >
          Guardar diagnósticos
        </button>
      </div>
    </div>
  );
}
