'use client';

import { RotateCcw } from 'lucide-react';
import { Fragment, useState } from 'react';

import { inputClassName } from '@/features/formulario-origen/presentation/FormField';
import { HALLAZGO_TEXT_MAX, type HallazgosCatalog, type Hallazgos } from '@/features/atenciones/domain/hallazgos';

import { formatAtencionFecha } from '../../AtencionesTable';
import type { SaveStatus } from '../useAutosave';

const SAVE_LABEL: Record<Exclude<SaveStatus, 'idle'>, string> = {
  saving: 'Guardando…',
  saved: 'Guardado',
  error: 'No se pudo guardar',
};

export function HallazgosTab({
  catalog,
  idPrefix,
  revision,
  mujer,
  readOnly,
  origen,
  heredadaDe,
  status,
  error,
  onChange,
}: {
  catalog: HallazgosCatalog;
  /** Prefijo de los id de los campos (únicos aunque haya dos formularios en la ficha). */
  idPrefix: string;
  revision: Hallazgos;
  mujer: boolean;
  readOnly: boolean;
  origen: 'propia' | 'heredada' | 'nueva';
  heredadaDe: string | null;
  status: SaveStatus;
  error: string | null;
  onChange: (updater: (current: Hallazgos) => Hallazgos) => void;
}) {
  const [onlyModified, setOnlyModified] = useState(false);
  const total = catalog.countModificados(revision, mujer);
  const visibles = catalog
    .visibles(mujer)
    .filter((item) => !onlyModified || catalog.modificado(item.key, revision.sistemas[item.key]));

  const setSistema = (key: string, value: string) =>
    onChange((current) => ({ ...current, sistemas: { ...current.sistemas, [key]: value } }));

  const saveLabel = readOnly || status === 'idle' ? null : status === 'error' && error ? error : SAVE_LABEL[status];
  const origenLabel =
    readOnly || origen === 'propia'
      ? null
      : origen === 'heredada' && heredadaDe
        ? `Precargada de la atención del ${formatAtencionFecha(heredadaDe)}`
        : 'Precargada con hallazgos normales';
  const meta = [saveLabel, origenLabel].filter(Boolean).join(' · ');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p
          role="status"
          className={`text-[11px] ${status === 'error' ? 'font-medium text-rose-700' : 'text-slate-500'}`}
        >
          {meta}
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={onlyModified}
            onChange={(event) => setOnlyModified(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-700 focus-visible:ring-sky-600"
          />
          Ver solo con hallazgos ({total})
        </label>
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
          Todo tiene el hallazgo normal.
        </p>
      ) : (
        <div className="grid gap-x-4 gap-y-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
          {visibles.map((item, index) => {
            const id = `${idPrefix}-${item.key}`;
            const startsGroup = Boolean(item.grupo) && item.grupo !== visibles[index - 1]?.grupo;
            const value = revision.sistemas[item.key];
            const modified = catalog.modificado(item.key, value);
            return (
              <Fragment key={item.key}>
                {startsGroup ? (
                  <h3 className="border-t border-slate-100 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:col-span-2">
                    {item.grupo}
                  </h3>
                ) : null}
                <div>
                  <div className="flex min-h-6 items-center justify-between gap-2">
                    <label htmlFor={id} className="text-xs font-semibold text-slate-700">
                      {item.label}
                    </label>
                    {modified ? (
                      <span className="flex items-center gap-2">
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                          Con hallazgo
                        </span>
                        {!readOnly ? (
                          <button
                            type="button"
                            onClick={() => setSistema(item.key, catalog.normalByKey[item.key])}
                            title={
                              catalog.normalByKey[item.key]
                                ? `Volver a: ${catalog.normalByKey[item.key]}`
                                : 'Dejar vacío'
                            }
                            className="inline-flex items-center gap-1 rounded text-[11px] font-medium text-slate-500 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                          >
                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                            Normal
                          </button>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                  <textarea
                    id={id}
                    value={value}
                    readOnly={readOnly}
                    rows={2}
                    maxLength={HALLAZGO_TEXT_MAX}
                    onChange={(event) => setSistema(item.key, event.target.value)}
                    className={`${inputClassName} mt-1 min-h-0 resize-y py-1.5 text-xs leading-5 ${modified ? 'font-medium text-slate-900' : 'text-slate-600'}`}
                  />
                </div>
              </Fragment>
            );
          })}
        </div>
      )}

      {!onlyModified || revision.fecha ? (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor={`${idPrefix}-fecha`} className="text-xs font-semibold text-slate-700">
              Fecha
            </label>
            <input
              id={`${idPrefix}-fecha`}
              type="date"
              value={revision.fecha ?? ''}
              readOnly={readOnly}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => onChange((current) => ({ ...current, fecha: event.target.value || null }))}
              className={`${inputClassName} mt-1 w-48`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
