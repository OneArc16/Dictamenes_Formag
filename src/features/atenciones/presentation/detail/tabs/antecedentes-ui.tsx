import type { FocusEvent, ReactNode } from 'react';

import { refiere } from '@/features/atenciones/domain/antecedentes-personales';

/** Si el campo tiene el valor por defecto (NO REFIERE, No), se selecciona al entrar para escribir encima. */
export function selectDefault(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  if (!refiere(event.target.value)) event.target.select();
}

export function Field({
  id,
  label,
  children,
  wide,
}: {
  id: string;
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="text-xs font-semibold text-slate-700">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function Card({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
        {count > 0 ? (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
            {count} {count === 1 ? 'refiere' : 'refieren'}
          </span>
        ) : null}
      </header>
      <div className="grid gap-x-4 gap-y-3 p-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
