'use client';

import { Building2, CalendarDays, Video } from 'lucide-react';

import type { AgendaModality } from '@/features/agenda/infrastructure/modalities';

const MODALITY_DETAILS: Record<string, { icon: typeof Building2; description: string }> = {
  PRESENCIAL: { icon: Building2, description: 'El paciente asiste a la sede.' },
  TELECONSULTA: { icon: Video, description: 'Atención a distancia, sin desplazamiento a la sede.' },
};

/** Selector compacto de agenda: cada modalidad es una agenda distinta con sus propios cupos. */
export function AgendaModalityPicker({
  modalities,
  modalityId,
  onSelect,
  disabled = false,
  bordered = true,
}: {
  modalities: AgendaModality[];
  modalityId: number | null;
  onSelect: (modalityId: number) => void;
  disabled?: boolean;
  /** Sin recuadro cuando va en línea con otros controles. */
  bordered?: boolean;
}) {

  return (
    <section
      aria-labelledby="agenda-modality-title"
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${
        bordered ? 'rounded-xl border border-slate-200 px-3 py-2' : ''
      }`}
    >
      <h2 id="agenda-modality-title" className="text-sm font-semibold text-slate-950">
        Tipo de agenda
      </h2>
      <div
        role="radiogroup"
        aria-labelledby="agenda-modality-title"
        className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
      >
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
              title={details?.description}
              disabled={disabled}
              onClick={() => {
                if (!selected) onSelect(modality.id);
              }}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${
                selected ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {modality.nombre}
            </button>
          );
        })}
      </div>
    </section>
  );
}
