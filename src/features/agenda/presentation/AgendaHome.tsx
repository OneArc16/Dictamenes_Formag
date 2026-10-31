'use client';

import { CalendarPlus2, History, LayoutList } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgendaGenerationsList from './AgendaGenerationsList';
import AgendaSlotsBoard from './AgendaSlotsBoard';

const triggerClass =
  'min-h-10 gap-2 rounded-lg px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-sky-800 data-[state=active]:shadow-sm';

export default function AgendaHome({ canCreate, canCancel }: { canCreate: boolean; canCancel: boolean }) {
  const [tab, setTab] = useState('cupos');

  return (
    <ModulePageLayout
      moduleKey="agenda"
      title="Agenda médica"
      description="Consulta todos los cupos de la agenda, búscalos por médico o paciente y filtra por fecha y estado."
      compactHero
      actions={
        canCreate ? (
          <Button asChild className="min-h-11 rounded-xl bg-sky-700 hover:bg-sky-800">
            <Link href="/agenda/crear"><CalendarPlus2 aria-hidden="true" /> Crear agenda</Link>
          </Button>
        ) : undefined
      }
    >
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
          <AgendaSlotsBoard canCancel={canCancel} />
        </TabsContent>
        <TabsContent value="generaciones" className="mt-0">
          <AgendaGenerationsList canCreate={canCreate} />
        </TabsContent>
      </Tabs>
    </ModulePageLayout>
  );
}
