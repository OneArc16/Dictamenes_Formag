import { Plus, Trash2 } from 'lucide-react';

import { AsyncCatalogInput } from '../AsyncCatalogInput';
import { FormField, inputClassName, SectionActions } from '../FormField';
import type { HistorialLaboralRow, ValidationIssue } from '../types';

export function HistorialLaboralTab({
  rows,
  readOnly,
  saving,
  issues,
  onChange,
  onSave,
  onContinue,
}: {
  rows: HistorialLaboralRow[];
  readOnly: boolean;
  saving: boolean;
  issues: ValidationIssue[];
  onChange: (rows: HistorialLaboralRow[]) => void;
  onSave: () => Promise<boolean | void> | boolean | void;
  onContinue: () => void;
}) {
  const update = (index: number, patch: Partial<HistorialLaboralRow>) => {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const remove = (index: number) => {
    const row = rows[index];
    const hasData = Object.entries(row).some(
      ([key, value]) => key !== 'id' && key !== 'tiempoExposicionAnios' && Boolean(value),
    );
    if (hasData && !window.confirm('Esta fila contiene datos. ¿Deseas quitarla?')) return;
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="space-y-6">
      {issues.some((issue) => issue.field === 'items') ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
          {issues.find((issue) => issue.field === 'items')?.message}
        </p>
      ) : null}

      <div className="space-y-4">
        {rows.map((row, index) => (
          <fieldset
            key={row.id}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <legend className="px-2 text-sm font-semibold text-slate-800">
              Experiencia {index + 1}
            </legend>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id={`institution-${row.id}`} label="Institución educativa" required>
                <AsyncCatalogInput
                  id={`institution-${row.id}`}
                  value={row.institucionNombreSnapshot}
                  disabled={readOnly}
                  endpoint="/api/instituciones/search"
                  responseKey="instituciones"
                  placeholder="Escribe mínimo 5 caracteres..."
                  minSearchLength={5}
                  onChange={(value, option) =>
                    update(index, {
                      institucionNombreSnapshot: value,
                      institucionId: option?.id ?? null,
                    })
                  }
                />
              </FormField>
              <FormField id={`job-${row.id}`} label="Cargo" required>
                <AsyncCatalogInput
                  id={`job-${row.id}`}
                  value={row.cargoNombreSnapshot}
                  disabled={readOnly}
                  endpoint="/api/cargos-docentes/search"
                  responseKey="items"
                  placeholder="Escribe mínimo 5 caracteres..."
                  minSearchLength={5}
                  onChange={(value, option) =>
                    update(index, {
                      cargoNombreSnapshot: value,
                      cargoId: option?.id ?? null,
                    })
                  }
                />
              </FormField>
              <FormField id={`risks-${row.id}`} label="Riesgos laborales" required>
                <textarea
                  id={`risks-${row.id}`}
                  value={row.riesgosLaborales}
                  readOnly={readOnly}
                  rows={3}
                  onChange={(event) => update(index, { riesgosLaborales: event.target.value })}
                  className={`${inputClassName} resize-y`}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id={`schedule-${row.id}`} label="Jornada laboral" required>
                  <input
                    id={`schedule-${row.id}`}
                    value={row.jornadaLaboral}
                    readOnly={readOnly}
                    onChange={(event) => update(index, { jornadaLaboral: event.target.value })}
                    className={inputClassName}
                  />
                </FormField>
                <FormField id={`exposure-${row.id}`} label="Exposición (años)" required>
                  <input
                    id={`exposure-${row.id}`}
                    type="number"
                    min={0}
                    step="0.1"
                    value={row.tiempoExposicionAnios}
                    readOnly={readOnly}
                    onChange={(event) =>
                      update(index, { tiempoExposicionAnios: Number(event.target.value) })
                    }
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </div>
            {!readOnly ? (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Quitar experiencia
                </button>
              </div>
            ) : null}
          </fieldset>
        ))}
      </div>

      {!readOnly ? (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...rows,
              {
                id: -Date.now(),
                institucionId: null,
                institucionNombreSnapshot: '',
                cargoId: null,
                cargoNombreSnapshot: '',
                riesgosLaborales: '',
                jornadaLaboral: '',
                tiempoExposicionAnios: 0,
              },
            ])
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-sky-500 bg-sky-50 px-4 text-sm font-semibold text-sky-800 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar institución
        </button>
      ) : null}

      <SectionActions
        saving={saving}
        readOnly={readOnly}
        onSave={onSave}
        onContinue={onContinue}
      />
    </div>
  );
}
