import { Building2, CalendarDays, Clock3 } from 'lucide-react';

import type { AgendaCreationContext } from '@/features/agenda/application/agenda-creation-context';

type ReadyContext = Extract<AgendaCreationContext, { status: 'ready' }>;

export function AgendaCreationHeader({ context }: { context: ReadyContext }) {
  return (
    <section
      aria-labelledby="agenda-site-title"
      className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h1
          id="agenda-site-title"
          className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700"
        >
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          Agenda médica
        </h1>
        <div className="mt-3 flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-sky-950">Sede asignada</h2>
            <p className="mt-0.5 break-words text-base font-medium text-sky-900">
              {context.site.name}
            </p>
          </div>
        </div>
      </div>
      <div className="flex min-h-11 items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 text-xs font-medium text-slate-600">
        <Clock3 className="h-4 w-4 text-sky-700" aria-hidden="true" />
        Zona horaria: Bogotá
      </div>
    </section>
  );
}
