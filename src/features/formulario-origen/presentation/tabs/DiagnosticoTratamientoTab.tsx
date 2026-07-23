import { Plus, Trash2 } from 'lucide-react';

import { Cie10DiagnosticoSelect } from '@/components/forms/Cie10DiagnosticoSelect';
import type { DiagnosticoRow, ValidationIssue } from '../types';

const DIAGNOSIS_TYPE_OPTIONS: Array<{
  value: DiagnosticoRow['tipo'];
  label: string;
}> = [
  { value: 'CONFIRMADO_NUEVO', label: 'Confirmado nuevo' },
  { value: 'IMPRESION_DIAGNOSTICA', label: 'Impresión diagnóstica' },
  { value: 'CONFIRMADO_REPETIDO', label: 'Confirmado repetido' },
];

const MINIMUM_VISIBLE_DIAGNOSES = 5;

function emptyDiagnosis(id: number): DiagnosticoRow {
  return {
    id,
    cie10Codigo: '',
    cie10Label: '',
    tipo: 'IMPRESION_DIAGNOSTICA',
    esPrincipal: false,
  };
}

function withMinimumDiagnosisRows(
  diagnosticos: DiagnosticoRow[],
): DiagnosticoRow[] {
  const rows = diagnosticos.map((diagnostico, index) => ({
    ...diagnostico,
    esPrincipal: index === 0,
  }));
  let nextTemporaryId =
    Math.min(0, ...rows.map((diagnostico) => diagnostico.id)) - 1;

  while (rows.length < MINIMUM_VISIBLE_DIAGNOSES) {
    rows.push(emptyDiagnosis(nextTemporaryId));
    nextTemporaryId -= 1;
  }

  return rows.map((diagnostico, index) => ({
    ...diagnostico,
    esPrincipal: index === 0,
  }));
}

export function DiagnosticoTratamientoTab({
  diagnosticos,
  readOnly,
  saving,
  issues,
  onDiagnosticosChange,
  onSave,
  onContinue,
}: {
  diagnosticos: DiagnosticoRow[];
  readOnly: boolean;
  saving: boolean;
  issues: ValidationIssue[];
  onDiagnosticosChange: (rows: DiagnosticoRow[]) => void;
  onSave: () => Promise<boolean | void> | boolean | void;
  onContinue: () => void;
}) {
  const visibleDiagnosticos = withMinimumDiagnosisRows(diagnosticos);

  const commit = (rows: DiagnosticoRow[]) => {
    onDiagnosticosChange(
      rows.map((row, index) => ({
        ...row,
        esPrincipal: index === 0,
      })),
    );
  };

  const update = (index: number, patch: Partial<DiagnosticoRow>) => {
    commit(
      visibleDiagnosticos.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const remove = (index: number) => {
    if (index === 0) return;

    if (visibleDiagnosticos.length <= MINIMUM_VISIBLE_DIAGNOSES) {
      commit(
        visibleDiagnosticos.map((row, rowIndex) =>
          rowIndex === index ? emptyDiagnosis(row.id) : row,
        ),
      );
      return;
    }

    commit(
      visibleDiagnosticos.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const add = () => {
    const nextTemporaryId =
      Math.min(
        0,
        ...visibleDiagnosticos.map((diagnostico) => diagnostico.id),
      ) - 1;
    commit(
      [...visibleDiagnosticos, emptyDiagnosis(nextTemporaryId)],
    );
  };

  return (
    <div className="space-y-6">
      {issues.some((issue) => issue.field === 'diagnosticos') ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
          {issues.find((issue) => issue.field === 'diagnosticos')?.message}
        </p>
      ) : null}

      <section
        aria-label="Diagnósticos CIE-10"
        className="space-y-4 text-xs text-slate-700"
      >
        <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] items-center gap-2 border-b border-slate-200 pb-2 text-[11px] font-semibold text-slate-500 md:grid">
          <div>Diagnóstico (CIE10)</div>
          <div>Tipo de diagnóstico</div>
          <div className="text-center">Opciones</div>
        </div>

        <div className="space-y-3">
          {visibleDiagnosticos.map((row, index) => (
            <div
              key={row.id}
              className="grid items-start gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] md:gap-2"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-h-5 items-center justify-between gap-2">
                  <label
                    htmlFor={`diagnosis-${row.id}`}
                    className="text-[11px] text-slate-500"
                  >
                    Diagnóstico {index + 1}
                    {index === 0 ? ' (principal)' : ''}
                  </label>
                </div>
                <Cie10DiagnosticoSelect
                  inputId={`diagnosis-${row.id}`}
                  value={row.cie10Codigo}
                  initialLabel={row.cie10Label}
                  disabled={readOnly}
                  onChange={(value, option) =>
                    update(index, {
                      cie10Codigo: value,
                      cie10Label: option?.label ?? value,
                    })
                  }
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1">
                <label
                  htmlFor={`diagnosis-type-${row.id}`}
                  className="min-h-5 text-[11px] text-slate-500"
                >
                  Tipo de diagnóstico
                </label>
                <select
                  id={`diagnosis-type-${row.id}`}
                  value={row.tipo}
                  disabled={readOnly}
                  onChange={(event) =>
                    update(index, {
                      tipo: event.target.value as DiagnosticoRow['tipo'],
                    })
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {DIAGNOSIS_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center md:justify-center md:pt-6">
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={index === 0}
                    aria-label={
                      index === 0
                        ? 'El diagnóstico principal no se puede quitar'
                        : `Quitar diagnóstico ${index + 1}`
                    }
                    title={
                      index === 0
                        ? 'El primer diagnóstico siempre es el principal'
                        : 'Quitar diagnóstico'
                    }
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition after:absolute after:-inset-1.5 after:content-[''] hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-300"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        {!readOnly ? (
          <button
            type="button"
            onClick={add}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-sky-500 bg-sky-50 px-4 text-sm font-semibold text-sky-800 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar diagnóstico
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            const result = await onSave();
            if (result !== false) onContinue();
          }}
          className="min-h-11 rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Guardando…' : readOnly ? 'Continuar' : 'Guardar y continuar'}
        </button>
      </div>
    </div>
  );
}
