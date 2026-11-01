'use client';

import { CalendarPlus2, History, LayoutList, MonitorSmartphone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AgendaModality } from '@/features/agenda/infrastructure/modalities';
import AgendaGenerationsList from './AgendaGenerationsList';
import AgendaSlotsBoard from './AgendaSlotsBoard';

const triggerClass =
  'min-h-10 gap-2 rounded-lg px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-sky-800 data-[state=active]:shadow-sm';

export default function AgendaHome({
  canCreate,
  canCancel,
  modalities,
}: {
  canCreate: boolean;
  canCancel: boolean;
  modalities: AgendaModality[];
}) {
  const [tab, setTab] = useState('cupos');
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
      <fieldset className="mb-4">
        <legend className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          <MonitorSmartphone className="h-4 w-4 text-sky-700" aria-hidden="true" /> Agenda
        </legend>
        <div className="flex flex-wrap gap-2">
          {modalities.map((modality) => (
            <Button
              key={modality.id}
              type="button"
              variant={modality.id === modalityId ? 'default' : 'outline'}
              aria-pressed={modality.id === modalityId}
              onClick={() => setModalityId(modality.id)}
              className="min-h-11 rounded-xl"
            >
              {modality.nombre}
            </Button>
          ))}
        </div>
      </fieldset>
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="h-auto rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="cupos" className={triggerClass}>
            <LayoutList className="h-4 w-4" aria-hidden="true" /> Cupos
          </TabsTrigger>
          <TabsTrigger value="generaciones" className={triggerClass}>
            <History className="h-4 w-4" aria-hidden="true" /> Generaciones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cupos" className="mt-0">
          <AgendaSlotsBoard canCancel={canCancel} modalityId={modalityId} />
        </TabsContent>
        <TabsContent value="generaciones" className="mt-0">
          <AgendaGenerationsList canCreate={canCreate} modalityId={modalityId} />
        </TabsContent>
      </Tabs>
    </ModulePageLayout>
  );
}
