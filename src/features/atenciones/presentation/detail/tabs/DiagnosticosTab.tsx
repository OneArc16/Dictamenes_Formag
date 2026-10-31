'use client';

import { Plus } from 'lucide-react';

import { Cie10DiagnosticoSelect } from '@/components/forms/Cie10DiagnosticoSelect';
import {
  MAX_DIAGNOSTICOS,
  TIPOS_DIAGNOSTICO,
  codigosRepetidos,
  filaVacia,
  type DiagnosticoFila,
  type TipoDiagnostico,
} from '@/features/atenciones/domain/diagnosticos';

import type { SaveStatus } from '../useAutosave';

const SAVE_LABEL: Record<Exclude<SaveStatus, 'idle'>, string> = {
  saving: 'Guardando…',
  saved: 'Guardado',
  error: 'No se pudieron guardar',
};

export function diagnosticoInputId(index: number) {
  return `diagnostico-${index}`;
}

/** Mismo diseño que los diagnósticos de Dictámenes: CIE10, tipo y quitar por fila; la primera es la principal. */
export function DiagnosticosTab({
  filas,
  readOnly,
  status,
  error,
  onChange,
}: {
  filas: DiagnosticoFila[];
  readOnly: boolean;
  status: SaveStatus;
  error: string | null;
  onChange: (updater: (current: DiagnosticoFila[]) => DiagnosticoFila[]) => void;
}) {
  const repetidos = codigosRepetidos(filas);
  const principalVacio = !filas[0]?.cie10Codigo.trim() && filas.some((fila) => fila.cie10Codigo.trim());
  const saveLabel = readOnly || status === 'idle' ? null : status === 'error' && error ? error : SAVE_LABEL[status];
  const visibles = readOnly ? filas.filter((fila) => fila.cie10Codigo) : filas;

  const setFila = (index: number, patch: Partial<DiagnosticoFila>) =>
    onChange((current) => current.map((fila, i) => (i === index ? { ...fila, ...patch } : fila)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-xs text-slate-600">
          Registra los diagnósticos CIE10 de la atención. El <span className="font-semibold">Diagnóstico 1</span> es el
          principal.
        </p>
        {saveLabel ? (
          <p
            role="status"
            className={`text-[11px] ${status === 'error' ? 'font-medium text-rose-700' : 'text-slate-500'}`}
          >
            {saveLabel}
          </p>
        ) : null}
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
          No se registraron diagnósticos.
        </p>
      ) : (
        <div className="space-y-1">
          <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] gap-3 border-b border-slate-200 px-2 pb-2 text-[11px] font-semibold text-slate-500 md:grid">
            <div>Diagnóstico (CIE10)</div>
            <div>Tipo de diagnóstico</div>
            <div className="w-16 text-center">Opciones</div>
          </div>

          {visibles.map((fila, index) => {
            const principal = index === 0;
            const repetido = repetidos.has(fila.cie10Codigo.trim().toUpperCase());
            const marcarPrincipal = principal && principalVacio;
            return (
              <div
                key={fila.id}
                className={`rounded-lg p-2 ${repetido ? 'bg-rose-50/60' : marcarPrincipal ? 'bg-amber-50/60' : ''}`}
              >
                {/* La etiqueta va en su propia línea para que los tres controles queden a la misma altura. */}
                <label
                  htmlFor={diagnosticoInputId(index)}
                  className={`block text-[11px] ${principal ? 'font-semibold text-slate-700' : 'text-slate-500'}`}
                >
                  Diagnóstico {index + 1}
                  {principal ? ' (principal)' : ''}
                  {principal ? <span className="ml-0.5 text-rose-700">*</span> : null}
                </label>
                <div className="mt-1 grid items-center gap-2 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] md:gap-3">
                  <div className="min-w-0">
                    <Cie10DiagnosticoSelect
                      inputId={diagnosticoInputId(index)}
                      value={fila.cie10Codigo}
                      initialLabel={fila.cie10Label || undefined}
                      disabled={readOnly}
                      onChange={(value, option) =>
                        setFila(index, { cie10Codigo: value ?? '', cie10Label: option?.label ?? '' })
                      }
                    />
                  </div>
                  <select
                    id={`${diagnosticoInputId(index)}-tipo`}
                    aria-label={`Tipo del diagnóstico ${index + 1}`}
                    value={fila.tipo}
                    disabled={readOnly}
                    onChange={(event) => setFila(index, { tipo: event.target.value as TipoDiagnostico })}
                    className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus-visible:border-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/25 disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    {TIPOS_DIAGNOSTICO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                  {!readOnly ? (
                    <div className="flex md:w-16 md:justify-center">
                      <button
                        type="button"
                        onClick={() => onChange((current) => current.filter((_, i) => i !== index))}
                        disabled={filas.length <= 1}
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] text-slate-500 transition hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : null}
                </div>
                {repetido ? (
                  <p className="mt-1 text-[11px] font-medium text-rose-700">Este diagnóstico ya está en la lista.</p>
                ) : marcarPrincipal ? (
                  <p className="mt-1 text-[11px] font-medium text-amber-800">
                    Falta el principal: se tomará como principal el primer diagnóstico con código.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {!readOnly ? (
        <button
          type="button"
          onClick={() => onChange((current) => [...current, filaVacia()])}
          disabled={filas.length >= MAX_DIAGNOSTICOS}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-dashed border-sky-400 bg-sky-50 px-3 text-xs font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Agregar diagnóstico
        </button>
      ) : null}
    </div>
  );
}
