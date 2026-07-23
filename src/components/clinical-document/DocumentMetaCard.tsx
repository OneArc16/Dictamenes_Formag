import type { ReactNode } from 'react';

type Status =
  | 'BORRADOR'
  | 'FINALIZADO'
  | 'PENDIENTE'
  | 'CERRADO'
  | 'REABIERTO';

const statusStyles: Record<Status, string> = {
  BORRADOR: 'border-amber-100 bg-amber-50 text-amber-700',
  PENDIENTE: 'border-amber-100 bg-amber-50 text-amber-700',
  FINALIZADO: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  CERRADO: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  REABIERTO: 'border-indigo-100 bg-indigo-50 text-indigo-700',
};

const statusLabel: Record<Status, string> = {
  BORRADOR: 'Borrador',
  FINALIZADO: 'Finalizado',
  PENDIENTE: 'Pendiente',
  CERRADO: 'Cerrado',
  REABIERTO: 'Reabierto',
};

export function DocumentMetaCard({
  title,
  number,
  status,
  date,
  savingLabel,
  numberLabel = 'N.° de Dictamen',
  dateLabel = 'Fecha de dictamen',
  dateHelper,
  dateInputId = 'clinical-document-date',
  readOnly,
  onDateChange,
  children,
}: {
  title: string;
  number: string | null;
  status: Status;
  date: string;
  savingLabel?: string;
  numberLabel?: string;
  dateLabel?: string;
  dateHelper?: string;
  dateInputId?: string;
  readOnly: boolean;
  onDateChange: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>

      <dl className="mt-3 space-y-3 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-xs text-slate-500">{numberLabel}</dt>
          <dd className="break-all text-right text-xs font-semibold text-slate-900">
            {number || 'Pendiente de fecha y documento'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs text-slate-500">Estado</dt>
          <dd>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${statusStyles[status]}`}
            >
              {statusLabel[status]}
            </span>
          </dd>
        </div>
      </dl>

      <label
        htmlFor={dateInputId}
        className="mt-3 block text-xs text-slate-500"
      >
        {dateLabel}
      </label>
      <input
        id={dateInputId}
        type="date"
        value={date}
        readOnly={readOnly}
        onChange={(event) => onDateChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 read-only:border-slate-200 read-only:bg-slate-50"
      />
      {dateHelper ? (
        <p className="mt-1 text-[11px] text-slate-400">{dateHelper}</p>
      ) : null}

      {children}

      {savingLabel ? (
        <p className="mt-3 text-[11px] text-slate-400" aria-live="polite">
          {savingLabel}
        </p>
      ) : null}
    </section>
  );
}
