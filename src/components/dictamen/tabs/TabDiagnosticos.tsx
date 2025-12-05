'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  useDiagnosticosDraft,
  DiagnosticoRowDraft,
  TipoDiagnosticoLocal,
} from '@/hooks/useDiagnosticosDraft';

import { Cie10DiagnosticoSelect } from '@/components/forms/Cie10DiagnosticoSelect';

type ProcedimientoPcl = 'A' | 'B';

type InitialDiagnostico = {
  cie10Codigo: string;
  tipo: TipoDiagnosticoLocal;
};

type Props = {
  dictamenId: number;
  procedimientoPcl: ProcedimientoPcl;
  /** Ya no usamos este prop, lo dejamos opcional por compatibilidad */
  cie10Options?: never;
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
  initialDiagnosticos,
}: Props) {
  const {
    diagnosticos,
    setDiagnosticos,
    loaded,
    saving: savingDraft,
  } = useDiagnosticosDraft(dictamenId);

  const [savingRemote, setSavingRemote] = useState(false);
  const [primaryError, setPrimaryError] = useState(false); // error en diagnóstico principal

  /**
   * Inicialización:
   * 1) Si Dexie ya tiene diagnósticos con CIE10 → respetamos Dexie (borrador).
   * 2) Si NO hay ningún diagnóstico con CIE10 en Dexie:
   *    2.1) Si initialDiagnosticos (BD) tiene datos → usamos esos.
   *    2.2) Si tampoco hay en BD → creamos 5 filas vacías.
   */
  useEffect(() => {
    if (!loaded) return;

    const hasAnyRealDx = diagnosticos.some(
      (r) => r.cie10Codigo && r.cie10Codigo.trim() !== '',
    );

    // Si hay algo real en Dexie, NO tocamos nada (respetamos el borrador)
    if (hasAnyRealDx) return;

    const now = Date.now();

    // 1) Si vienen diagnósticos desde BD, los usamos
    if (initialDiagnosticos && initialDiagnosticos.length > 0) {
      const rowsFromDb: DiagnosticoRowDraft[] =
        initialDiagnosticos.map((dx, idx) => ({
          id: `row-db-${idx + 1}-${now}`,
          cie10Codigo: dx.cie10Codigo,
          // de momento usamos el código como label si no tenemos el nombre
          cie10Label: dx.cie10Codigo,
          tipo: dx.tipo,
        }));
      setDiagnosticos(rowsFromDb);
      return;
    }

    // 2) Si no hay nada en BD y además el borrador está vacío, creamos 5 filas
    if (diagnosticos.length === 0) {
      const iniciales: DiagnosticoRowDraft[] = Array.from({
        length: 5,
      }).map((_, idx) => ({
        id: `row-${idx + 1}-${now}`,
        tipo: 'IMPRESION_DIAGNOSTICA',
      }));

      setDiagnosticos(iniciales);
    }
  }, [loaded, diagnosticos, initialDiagnosticos, setDiagnosticos]);

  const handleRowChange = (
    index: number,
    patch: Partial<DiagnosticoRowDraft>,
  ) => {
    const rows = [...diagnosticos];
    rows[index] = { ...rows[index], ...patch };
    setDiagnosticos(rows);

    // Si estamos modificando el diagnóstico 1 y ahora tiene código, limpiamos el error
    if (
      index === 0 &&
      patch.cie10Codigo &&
      patch.cie10Codigo.trim() !== ''
    ) {
      setPrimaryError(false);
    }
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
        'Debes colocar el diagnóstico principal (Diagnóstico 1).',
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
      // Seguridad extra, aunque ya validamos el primero
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
                  <Cie10DiagnosticoSelect
                    value={row.cie10Codigo ?? ''}
                    label={row.cie10Label ?? row.cie10Codigo ?? ''}
                    onChange={(code, label) =>
                      handleRowChange(index, {
                        cie10Codigo: code || undefined,
                        cie10Label: label,
                      })
                    }
                  />
                </div>
                {showPrimaryError && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Debes colocar el diagnóstico principal (Diagnóstico 1).
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
          );
        })}
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
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          Guardar diagnósticos
        </button>
      </div>
    </div>
  );
}
