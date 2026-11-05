'use client';

import { CalendarPlus2, LayoutList } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import type { AgendaModality } from '@/features/agenda/infrastructure/modalities';
import { AgendaModalityPicker } from './AgendaModalityPicker';
import AgendaSlotsBoard from './AgendaSlotsBoard';

export default function AgendaHome({
  canCreate,
  canCancel,
  modalities,
}: {
  canCreate: boolean;
  canCancel: boolean;
  modalities: AgendaModality[];
}) {
  // Cada modalidad es una agenda distinta con sus propios horarios y cupos.
  const [modalityId, setModalityId] = useState<number | null>(modalities[0]?.id ?? null);

  return (
    <ModulePageLayout
      moduleKey="agenda"
      title="Agenda médica"
      description="Consulta los cupos de cada agenda (presencial o teleconsulta), búscalos por médico o paciente y filtra por fecha y estado."
      compactHero
      actions={
        canCreate ? (
          <Button asChild className="min-h-11 rounded-xl bg-sky-700 hover:bg-sky-800">
            <Link href={modalityId ? `/agenda/crear?modalidadId=${modalityId}` : '/agenda/crear'}>
              <CalendarPlus2 aria-hidden="true" /> Crear agenda
            </Link>
          </Button>
        ) : undefined
      }
    >
      <section aria-labelledby="agenda-cupos-title" className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <h2 id="agenda-cupos-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <LayoutList className="h-4 w-4 text-sky-700" aria-hidden="true" /> Cupos
          </h2>
          <AgendaModalityPicker
            modalities={modalities}
            modalityId={modalityId}
            onSelect={setModalityId}
            bordered={false}
          />
        </div>
        <AgendaSlotsBoard canCancel={canCancel} modalityId={modalityId} />
      </section>
    </ModulePageLayout>
  );
}
