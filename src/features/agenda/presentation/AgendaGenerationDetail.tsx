'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ListChecks,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { IconTooltip } from '@/components/ui/icon-tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { agendaRequest } from './api-client';
import CancelSlotsDialog from './CancelSlotsDialog';
import {
  availableSlotIds,
  filterAgendaSlots,
  toggleAllAvailableSlots,
} from './slot-selection';

type GenerationDetail = {
  id: number;
  sedeNombre: string;
  fechaInicial: string;
  fechaFinal: string;
  duracionMinutos: number;
  zonaHoraria: string;
  estado: string;
  totalMedicos: number;
  totalCandidatos: number;
  totalCreados: number;
  totalOmitidos: number;
  totalConflictos: number;
  createdAt: string;
  createdBy: string;
  medicos: Array<{
    medicoId: number;
    medicoNombre: string;
    horarioNombre: string;
    totalCandidatos: number;
    totalCreados: number;
    totalOmitidos: number;
    totalConflictos: number;
  }>;
  fechasExcluidas: Array<{ medicoId: number | null; fecha: string; motivo: string | null }>;
  cupos: Array<{ id: number; medicoId: number; inicio: string; fin: string; estado: string }>;
  cuposTruncados: boolean;
};

function formatDateTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium', timeStyle: 'short', timeZone,
  }).format(new Date(value));
}

function statusStyle(status: string) {
  if (status === 'DISPONIBLE') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === 'CANCELADO') return 'border-slate-200 bg-slate-100 text-slate-700';
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

export default function AgendaGenerationDetail({ id, canCancel }: { id: number; canCancel: boolean }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const query = useQuery<{ generation: GenerationDetail }>({
    queryKey: ['agenda-generation', id],
    queryFn: () => agendaRequest(`/api/agenda/generaciones/${id}`),
  });
  const generation = query.data?.generation;
  const doctorNames = useMemo(() => new Map(generation?.medicos.map((doctor) => [doctor.medicoId, doctor.medicoNombre]) ?? []), [generation]);
  const filteredSlots = useMemo(
    () =>
      filterAgendaSlots(
        generation?.cupos ?? [],
        {
          medicoId: doctorFilter === 'all' ? null : Number(doctorFilter),
          date: dateFilter,
        },
        generation?.zonaHoraria ?? 'America/Bogota',
      ),
    [dateFilter, doctorFilter, generation?.cupos, generation?.zonaHoraria],
  );
  const allCancellableIds = useMemo(
    () => availableSlotIds(generation?.cupos ?? []),
    [generation?.cupos],
  );
  const visibleCancellableIds = useMemo(
    () => availableSlotIds(filteredSlots),
    [filteredSlots],
  );
  const selectedCancellableIds = useMemo(
    () => allCancellableIds.filter((slotId) => selected.has(slotId)),
    [allCancellableIds, selected],
  );
  const allCancellableSelected =
    visibleCancellableIds.length > 0 &&
    visibleCancellableIds.every((slotId) => selected.has(slotId));
  const cancellation = useMutation<
    { cancelados: number; omitidos: number },
    Error,
    number[]
  >({
    mutationFn: (cupoIds) => agendaRequest('/api/agenda/cupos/cancelar', {
      method: 'POST', body: JSON.stringify({ cupoIds, motivo: 'Cancelación desde el detalle de generación' }),
    }),
    onSuccess: async (data) => {
      setMessage(`${data.cancelados} cupos cancelados; ${data.omitidos} omitidos.`);
      setSelected(new Set());
      setCancelDialogOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['agenda-generation', id] }),
        queryClient.invalidateQueries({ queryKey: ['agenda-generations'] }),
      ]);
    },
  });

  function toggle(idToToggle: number, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(idToToggle); else next.delete(idToToggle);
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) =>
      toggleAllAvailableSlots(current, visibleCancellableIds),
    );
  }

  function openCancelDialog() {
    cancellation.reset();
    setMessage('');
    setCancelDialogOpen(true);
  }

  function handleCancelDialogOpenChange(open: boolean) {
    if (cancellation.isPending) return;
    setCancelDialogOpen(open);
    if (!open) cancellation.reset();
  }

  if (query.isLoading) {
    return <ModulePageLayout moduleKey="agenda" title={`Generación #${id}`} description="Cargando detalle de agenda…"><div className="h-56 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" /></ModulePageLayout>;
  }
  if (query.isError || !generation) {
    return <ModulePageLayout moduleKey="agenda" title={`Generación #${id}`} description="No fue posible consultar el detalle."><Card><CardContent className="p-6"><div role="alert" className="text-sm text-rose-800">{query.error instanceof Error ? query.error.message : 'Generación no encontrada.'}</div><Button type="button" variant="outline" className="mt-4 min-h-11" onClick={() => query.refetch()}><RefreshCw aria-hidden="true" /> Reintentar</Button></CardContent></Card></ModulePageLayout>;
  }

  return (
    <ModulePageLayout
      moduleKey="agenda"
      title={`Generación #${generation.id}`}
      description={`${generation.sedeNombre} · ${generation.fechaInicial} a ${generation.fechaFinal} · ${generation.duracionMinutos} minutos`}
      compactHero
      stats={[
        { label: 'Médicos', value: String(generation.totalMedicos) },
        { label: 'Candidatos', value: String(generation.totalCandidatos) },
        { label: 'Creados', value: String(generation.totalCreados) },
        { label: 'Omitidos', value: String(generation.totalOmitidos) },
      ]}
      actions={<Button asChild variant="outline" className="min-h-11"><Link href="/agenda"><ArrowLeft aria-hidden="true" /> Volver</Link></Button>}
    >
      {message ? <div role="status" aria-live="polite" className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">{message}</div> : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm lg:col-span-2"><CardHeader className="border-b border-slate-100 p-5"><CardTitle className="text-base">Resultado por médico</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Médico</th><th className="p-4">Horario</th><th className="p-4 text-right">Creados</th><th className="p-4 text-right">Omitidos</th></tr></thead><tbody>{generation.medicos.map((doctor) => <tr key={doctor.medicoId} className="border-t border-slate-100"><td className="p-4 font-medium text-slate-900">{doctor.medicoNombre}</td><td className="p-4 text-slate-600">{doctor.horarioNombre}</td><td className="p-4 text-right tabular-nums">{doctor.totalCreados}</td><td className="p-4 text-right tabular-nums">{doctor.totalOmitidos}</td></tr>)}</tbody></table></div></CardContent></Card>
        <Card className="border-slate-200 bg-white shadow-sm"><CardHeader className="border-b border-slate-100 p-5"><CardTitle className="text-base">Trazabilidad</CardTitle></CardHeader><CardContent className="space-y-3 p-5 text-sm"><div><span className="block text-xs font-medium text-slate-500">Estado</span><span className="mt-1 block font-semibold text-slate-900">{generation.estado.replaceAll('_', ' ')}</span></div><div><span className="block text-xs font-medium text-slate-500">Creada por</span><span className="mt-1 block text-slate-800">{generation.createdBy}</span></div><div><span className="block text-xs font-medium text-slate-500">Fecha</span><span className="mt-1 block text-slate-800">{formatDateTime(generation.createdAt, generation.zonaHoraria)}</span></div><div><span className="block text-xs font-medium text-slate-500">Fechas excluidas</span><span className="mt-1 block tabular-nums text-slate-800">{generation.fechasExcluidas.length}</span></div></CardContent></Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Cupos generados</CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Horas mostradas en {generation.zonaHoraria}.
                {generation.cuposTruncados
                  ? ' Se muestran los primeros 500 cupos; la selección total aplica a los visibles.'
                  : ''}
              </p>
            </div>

            {canCancel ? (
              <div className="flex items-center gap-2">
                <span
                  aria-live="polite"
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs tabular-nums text-slate-600"
                >
                  {selectedCancellableIds.length} seleccionados
                </span>

                <IconTooltip
                  id={`agenda-select-all-slots-${generation.id}`}
                  label={
                    allCancellableSelected
                      ? 'Deseleccionar todos los cupos disponibles'
                      : 'Seleccionar todos los cupos disponibles'
                  }
                  align="right"
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={`h-11 w-11 rounded-full shadow-none transition-colors duration-200 ${
                      allCancellableSelected
                        ? 'border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100'
                        : 'border-slate-200 text-sky-700 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-800'
                    }`}
                    disabled={
                      visibleCancellableIds.length === 0 || cancellation.isPending
                    }
                    aria-label={
                      allCancellableSelected
                        ? 'Deseleccionar todos los cupos disponibles mostrados'
                        : 'Seleccionar todos los cupos disponibles mostrados'
                    }
                    aria-describedby={`agenda-select-all-slots-${generation.id}`}
                    aria-pressed={allCancellableSelected}
                    onClick={toggleAll}
                  >
                    <ListChecks className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </IconTooltip>

                <IconTooltip
                  id={`agenda-cancel-selected-slots-${generation.id}`}
                  label={
                    selectedCancellableIds.length > 0
                      ? `Cancelar ${selectedCancellableIds.length} cupos`
                      : 'Selecciona cupos para cancelar'
                  }
                  align="right"
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-11 w-11 rounded-full bg-rose-700 text-white shadow-none transition-colors duration-200 hover:bg-rose-800"
                    disabled={
                      selectedCancellableIds.length === 0 || cancellation.isPending
                    }
                    aria-label={
                      cancellation.isPending
                        ? 'Cancelando cupos seleccionados'
                        : `Cancelar ${selectedCancellableIds.length} cupos seleccionados`
                    }
                    aria-describedby={`agenda-cancel-selected-slots-${generation.id}`}
                    onClick={openCancelDialog}
                  >
                    {cancellation.isPending ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    ) : (
                      <Ban className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </IconTooltip>
              </div>
            ) : null}
          </div>
        </CardHeader>

        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-[minmax(220px,1fr)_minmax(180px,0.65fr)_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label
              htmlFor="agenda-slot-doctor-filter"
              className="text-xs font-medium text-slate-700"
            >
              Médico
            </Label>
            <Select
              value={doctorFilter}
              onValueChange={setDoctorFilter}
              disabled={cancellation.isPending}
            >
              <SelectTrigger
                id="agenda-slot-doctor-filter"
                aria-controls="agenda-generated-slots-table"
                className="h-11 border-slate-300 bg-white shadow-none focus:ring-2 focus:ring-sky-500/60"
              >
                <SelectValue placeholder="Todos los médicos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los médicos</SelectItem>
                {generation.medicos.map((doctor) => (
                  <SelectItem
                    key={doctor.medicoId}
                    value={String(doctor.medicoId)}
                  >
                    {doctor.medicoNombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="agenda-slot-date-filter"
              className="text-xs font-medium text-slate-700"
            >
              Fecha
            </Label>
            <Input
              id="agenda-slot-date-filter"
              type="date"
              value={dateFilter}
              min={generation.fechaInicial}
              max={generation.fechaFinal}
              disabled={cancellation.isPending}
              aria-controls="agenda-generated-slots-table"
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-11 border-slate-300 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
            />
          </div>

          <p
            aria-live="polite"
            className="min-h-11 self-end rounded-xl bg-white px-3 py-3 text-center text-xs tabular-nums text-slate-600 sm:min-w-28"
          >
            {filteredSlots.length} de {generation.cupos.length} cupos
          </p>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table
              id="agenda-generated-slots-table"
              className="w-full min-w-[720px] text-left text-sm"
            >
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {canCancel ? (
                    <th className="w-14 p-4">
                      <span className="sr-only">Seleccionar</span>
                    </th>
                  ) : null}
                  <th className="p-4">Médico</th>
                  <th className="p-4">Inicio</th>
                  <th className="p-4">Fin</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canCancel ? 5 : 4}
                      className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-600"
                    >
                      No hay cupos que coincidan con el médico y la fecha
                      seleccionados.
                    </td>
                  </tr>
                ) : filteredSlots.map((slot) => {
                  const isSelected = selected.has(slot.id);
                  return (
                    <tr
                      key={slot.id}
                      className={`border-t border-slate-100 transition-colors ${
                        isSelected ? 'bg-sky-50/60' : 'bg-white'
                      }`}
                    >
                      {canCancel ? (
                        <td className="p-4">
                          <Checkbox
                            aria-label={`Seleccionar cupo ${slot.id}`}
                            className="h-5 w-5"
                            disabled={slot.estado !== 'DISPONIBLE'}
                            checked={isSelected}
                            onCheckedChange={(value) =>
                              toggle(slot.id, value === true)
                            }
                          />
                        </td>
                      ) : null}
                      <td className="p-4 font-medium text-slate-900">
                        {doctorNames.get(slot.medicoId) ??
                          `Médico #${slot.medicoId}`}
                      </td>
                      <td className="p-4 tabular-nums text-slate-700">
                        {formatDateTime(slot.inicio, generation.zonaHoraria)}
                      </td>
                      <td className="p-4 tabular-nums text-slate-700">
                        {formatDateTime(slot.fin, generation.zonaHoraria)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(slot.estado)}`}
                        >
                          {slot.estado === 'DISPONIBLE' ? (
                            <CheckCircle2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          ) : null}
                          {slot.estado.toLocaleLowerCase('es-CO')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CancelSlotsDialog
        count={selectedCancellableIds.length}
        errorMessage={cancellation.error?.message}
        isPending={cancellation.isPending}
        onConfirm={() => cancellation.mutate(selectedCancellableIds)}
        onOpenChange={handleCancelDialogOpenChange}
        open={cancelDialogOpen}
      />
    </ModulePageLayout>
  );
}
