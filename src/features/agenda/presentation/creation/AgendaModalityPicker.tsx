'use client';

import { Building2, CalendarDays, CheckCircle2, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { AgendaModality } from '@/features/agenda/infrastructure/modalities';

const MODALITY_DETAILS: Record<string, { icon: typeof Building2; description: string }> = {
  PRESENCIAL: { icon: Building2, description: 'El paciente asiste a la sede.' },
  TELECONSULTA: { icon: Video, description: 'Atención a distancia, sin desplazamiento a la sede.' },
};

/** Primer paso de la agenda: cada modalidad es una agenda distinta con sus propios cupos. */
export function AgendaModalityPicker({
  siteId,
  modalities,
  modalityId,
  disabled = false,
}: {
  siteId: number;
  modalities: AgendaModality[];
  modalityId: number;
  disabled?: boolean;
}) {
  const router = useRouter();

  return (
    <section aria-labelledby="agenda-modality-title" className="rounded-xl border border-slate-200 p-3 sm:p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="agenda-modality-title" className="text-base font-semibold text-slate-950">
          Tipo de agenda
        </h2>
        <p className="text-xs text-slate-500">Al cambiarla se reinicia la configuración.</p>
      </div>
      <div role="radiogroup" aria-labelledby="agenda-modality-title" className="mt-3 grid gap-3 sm:grid-cols-2">
        {modalities.map((modality) => {
          const details = MODALITY_DETAILS[modality.codigo];
          const Icon = details?.icon ?? CalendarDays;
          const selected = modality.id === modalityId;
          return (
            <button
              key={modality.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => {
                if (!selected) {
                  router.replace(`/agenda/crear?sedeId=${siteId}&modalidadId=${modality.id}`, { scroll: false });
                }
              }}
              className={`flex min-h-16 items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${
                selected
                  ? 'border-sky-600 bg-sky-50 ring-1 ring-sky-600'
                  : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selected ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-950">{modality.nombre}</span>
                {details ? <span className="block text-xs text-slate-600">{details.description}</span> : null}
              </span>
              {selected ? <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
