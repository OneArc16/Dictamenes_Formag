'use client';

import { useState } from 'react';

import type { AntecedenteKind } from '@/features/atenciones/application/antecedentes';
import {
  countRefiereFamiliares,
  type AntecedentesFamiliares,
} from '@/features/atenciones/domain/antecedentes-familiares';
import type { AntecedentesPersonales } from '@/features/atenciones/domain/antecedentes-personales';

import { formatAtencionFecha, formatAtencionHora } from '../../AtencionesTable';
import type { useAntecedentes } from '../useAntecedentes';
import type { SaveStatus } from '../useAutosave';
import { AntecedentesFamiliaresForm } from './AntecedentesFamiliaresForm';
import { AntecedentesPersonalesForm, countPersonalesRefiere } from './AntecedentesPersonalesForm';

type AntecedentesState<T> = ReturnType<typeof useAntecedentes<T>>;

const KINDS: Array<{ id: AntecedenteKind; label: string }> = [
  { id: 'personales', label: 'Personales' },
  { id: 'familiares', label: 'Familiares' },
];

const SAVE_LABEL: Record<Exclude<SaveStatus, 'idle'>, string> = {
  saving: 'Guardando…',
  saved: 'Guardado',
  error: 'No se pudieron guardar',
};

export function AntecedentesTab({
  personales,
  familiares,
  readOnly,
  snapshot,
}: {
  personales: AntecedentesState<AntecedentesPersonales>;
  familiares: AntecedentesState<AntecedentesFamiliares>;
  readOnly: boolean;
  /** Muestra la copia guardada al finalizar la atención. */
  snapshot: boolean;
}) {
  const [kind, setKind] = useState<AntecedenteKind>('personales');
  const [onlyRefiere, setOnlyRefiere] = useState(false);
  const current = kind === 'personales' ? personales : familiares;
  const total =
    kind === 'personales' ? countPersonalesRefiere(personales.datos) : countRefiereFamiliares(familiares.datos);
  const saveLabel =
    readOnly || current.status === 'idle'
      ? null
      : current.status === 'error' && current.error
        ? current.error
        : SAVE_LABEL[current.status];
  const actualizado = snapshot
    ? 'Antecedentes registrados al finalizar esta atención'
    : current.actualizadoEn
      ? `Actualizado ${formatAtencionFecha(current.actualizadoEn)} ${formatAtencionHora(current.actualizadoEn)}${
          current.actualizadoPor ? ` por ${current.actualizadoPor}` : ''
        }`
      : null;
  const meta = [saveLabel, actualizado].filter((value): value is string => Boolean(value));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div
          role="tablist"
          aria-label="Tipo de antecedentes"
          className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
        >
          {KINDS.map((option) => {
            const active = option.id === kind;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKind(option.id)}
                className={`min-h-8 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                  active ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={onlyRefiere}
            onChange={(event) => setOnlyRefiere(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-700 focus-visible:ring-sky-600"
          />
          Ver solo lo que refiere ({total})
        </label>
      </div>

      {/* Una sola línea: estado del guardado y última actualización (solo si hay algo que decir). */}
      {meta.length > 0 ? (
        <p
          role="status"
          className={`text-[11px] ${current.status === 'error' ? 'font-medium text-rose-700' : 'text-slate-500'}`}
        >
          {meta.join(' · ')}
        </p>
      ) : null}

      {kind === 'personales' ? (
        <AntecedentesPersonalesForm
          antecedentes={personales.datos}
          readOnly={readOnly}
          onlyRefiere={onlyRefiere}
          onChange={personales.update}
        />
      ) : (
        <AntecedentesFamiliaresForm
          antecedentes={familiares.datos}
          readOnly={readOnly}
          onlyRefiere={onlyRefiere}
          onChange={familiares.update}
        />
      )}
    </div>
  );
}
