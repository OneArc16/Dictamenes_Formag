import type { ReactNode } from 'react';

export const inputClassName =
  'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus-visible:border-sky-600 focus-visible:ring-2 focus-visible:ring-sky-600/25 read-only:border-slate-200 read-only:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

export function FormField({
  id,
  label,
  required,
  helper,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="ml-1 text-rose-700">*</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {helper ? <p className="mt-1.5 text-xs leading-5 text-slate-500">{helper}</p> : null}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SectionActions({
  saving,
  readOnly,
  onSave,
  onContinue,
}: {
  saving: boolean;
  readOnly: boolean;
  onSave: () => Promise<boolean | void> | boolean | void;
  onContinue?: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
      {!readOnly ? (
        <button
          type="button"
          onClick={async () => {
            const result = await onSave();
            if (result !== false) onContinue?.();
          }}
          disabled={saving}
          className="min-h-11 rounded-lg border border-sky-700 bg-white px-4 text-sm font-semibold text-sky-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Guardando…' : onContinue ? 'Guardar y continuar' : 'Guardar sección'}
        </button>
      ) : null}
      {readOnly && onContinue ? (
        <button
          type="button"
          onClick={onContinue}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Continuar
        </button>
      ) : null}
    </div>
  );
}
