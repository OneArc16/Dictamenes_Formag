'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarPlus2, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { agendaRequest } from './api-client';

type GenerationRow = {
  id: number;
  sedeNombre: string;
  fechaInicial: string;
  fechaFinal: string;
  duracionMinutos: number;
  estado: string;
  totalMedicos: number;
  totalCreados: number;
  totalOmitidos: number;
  createdAt: string;
  createdBy: string;
};

function statusLabel(status: string) {
  return status.replaceAll('_', ' ').toLocaleLowerCase('es-CO').replace(/^./, (value) => value.toUpperCase());
}

export default function AgendaGenerationsList({ canCreate }: { canCreate: boolean }) {
  const query = useQuery<{ rows: GenerationRow[]; total: number }>({
    queryKey: ['agenda-generations'],
    queryFn: () => agendaRequest('/api/agenda/generaciones'),
  });
  const rows = query.data?.rows ?? [];

  return (
    <ModulePageLayout
      moduleKey="agenda"
      title="Agendas creadas"
      description="Consulta las generaciones de cupos, sus resultados y la trazabilidad de cada operación."
      compactHero
      stats={[
        { label: 'Generaciones visibles', value: String(query.data?.total ?? 0) },
        { label: 'Cupos en esta página', value: String(rows.reduce((sum, row) => sum + row.totalCreados, 0)) },
      ]}
      actions={
        canCreate ? (
          <Button asChild className="min-h-11 rounded-xl bg-sky-700 hover:bg-sky-800">
            <Link href="/agenda/crear"><CalendarPlus2 aria-hidden="true" /> Crear agenda</Link>
          </Button>
        ) : undefined
      }
    >
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">
          {query.isLoading ? (
            <div className="space-y-3" aria-label="Cargando agendas">
              {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none" />)}
            </div>
          ) : query.isError ? (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
              <p>{query.error instanceof Error ? query.error.message : 'No se pudieron cargar las agendas.'}</p>
              <Button type="button" variant="outline" onClick={() => query.refetch()} className="mt-4 min-h-11">
                <RefreshCw aria-hidden="true" /> Reintentar
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
              <h2 className="text-base font-semibold text-slate-900">Todavía no hay agendas visibles</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                Cuando se confirme una generación aparecerá aquí con sus cupos creados y omisiones.
              </p>
              {canCreate ? <Button asChild className="mt-5 min-h-11"><Link href="/agenda/crear">Crear la primera agenda</Link></Button> : null}
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <Link
                  key={row.id}
                  href={`/agenda/generaciones/${row.id}`}
                  className="group grid min-h-20 gap-3 rounded-2xl border border-slate-200 p-4 transition-colors duration-200 hover:border-sky-300 hover:bg-sky-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 motion-reduce:transition-none sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">Generación #{row.id}</span>
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">{statusLabel(row.estado)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {row.sedeNombre} · {row.fechaInicial} a {row.fechaFinal} · {row.duracionMinutos} min
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{row.totalMedicos} médicos · {row.totalCreados} creados · {row.totalOmitidos} omitidos</p>
                  </div>
                  <span className="flex min-h-11 items-center gap-2 text-sm font-semibold text-sky-800">
                    Ver detalle <ChevronRight aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}
