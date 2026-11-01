'use client';

import { Building2, CalendarDays, Clock3, MonitorSmartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { AgendaCreationContext } from '@/features/agenda/application/agenda-creation-context';
import type { AgendaModality } from '@/features/agenda/infrastructure/modalities';

type ReadyContext = Extract<AgendaCreationContext, { status: 'ready' }>;
type AgendaSiteOption = { id: number; name: string };

export function AgendaCreationHeader({
  context,
  siteOptions = [],
  modalities,
  modalityId,
  disabled = false,
}: {
  context: ReadyContext;
  siteOptions?: AgendaSiteOption[];
  modalities: AgendaModality[];
  modalityId: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const canSelectSite = siteOptions.length > 1;
  // Cada modalidad es una agenda distinta: cambiarla reinicia el formulario.
  const goTo = (siteId: number, nextModalityId: number) =>
    router.replace(`/agenda/crear?sedeId=${siteId}&modalidadId=${nextModalityId}`, { scroll: false });

  return (
    <section
      aria-labelledby="agenda-site-title"
      className="flex flex-col gap-2 rounded-xl border border-sky-100 bg-sky-50/70 p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h1
          id="agenda-site-title"
          className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700"
        >
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          Agenda médica
        </h1>
        <div className="mt-2 flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
            <Building2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            {canSelectSite ? (
              <>
                <label htmlFor="agenda-site-selector" className="text-sm font-semibold text-sky-950">
                  Sede para la agenda
                </label>
                <select
                  id="agenda-site-selector"
                  value={context.site.id}
                  onChange={(event) => {
                    const siteId = Number(event.target.value);
                    if (Number.isInteger(siteId) && siteId > 0) {
                      goTo(siteId, modalityId);
                    }
                  }}
                  className="mt-0.5 min-h-10 max-w-full bg-white pr-9 text-sm font-semibold text-sky-900"
                >
                  {siteOptions.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-sky-950">Sede asignada</h2>
                <p className="mt-0.5 break-words text-sm font-semibold text-sky-900">
                  {context.site.name}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <fieldset className="min-w-0 self-start sm:self-auto">
        <legend className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-950">
          <MonitorSmartphone className="h-4 w-4 text-sky-700" aria-hidden="true" />
          Modalidad de la agenda
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {modalities.map((modality) => (
            <button
              key={modality.id}
              type="button"
              aria-pressed={modality.id === modalityId}
              disabled={disabled}
              onClick={() => {
                if (modality.id !== modalityId) goTo(context.site.id, modality.id);
              }}
              className={`min-h-10 rounded-lg border px-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                modality.id === modalityId
                  ? 'border-sky-700 bg-sky-700 text-white'
                  : 'border-sky-100 bg-white text-sky-900 hover:bg-sky-100'
              }`}
            >
              {modality.nombre}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex min-h-10 items-center gap-2 self-start rounded-lg border border-sky-100 bg-white px-3 text-xs font-medium text-slate-600 sm:self-auto">
        <Clock3 className="h-4 w-4 text-sky-700" aria-hidden="true" />
        Zona horaria: Bogotá
      </div>
    </section>
  );
}
