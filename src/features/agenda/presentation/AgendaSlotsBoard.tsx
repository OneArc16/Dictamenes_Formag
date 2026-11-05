'use client';

import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  CalendarDays,
  CalendarSearch,
  ChevronDown,
  FilterX,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { differenceInCalendarDays } from '@/features/agenda/domain/date-time';
import { cn } from '@/lib/utils';
import {
  DATE_PRESETS,
  chunk,
  formatDayHeading,
  formatTime,
  groupSlotsByDay,
  initials,
  presetRange,
  todayInAgendaZone,
  type AgendaSlotRow,
  type DatePresetId,
  type SlotStatus,
} from './agenda-slots-view';
import { agendaRequest } from './api-client';
import CancelSlotsDialog from './CancelSlotsDialog';
import RestoreSlotDialog from './RestoreSlotDialog';

const PAGE_SIZE = 100;
const DEFAULT_PRESET = 'treinta' as const;
/** Igual al máximo que acepta GET /api/agenda/cupos (91 días inclusive). */
const MAX_RANGE_DAYS = 90;
const CANCEL_BATCH_SIZE = 500;
const EMPTY_SELECTION: ReadonlySet<number> = new Set();

type SlotsResponse = {
  total: number;
  page: number;
  hasMore: boolean;
  conteos: Record<SlotStatus, number>;
  medicos: Array<{ id: number; nombre: string; total: number }>;
  rows: AgendaSlotRow[];
};

const STATUS_META: Record<
  SlotStatus,
  { label: string; singular: string; chip: string; badge: string; bar: string; dot: string }
> = {
  LIBRE: {
    label: 'Cupos libres',
    singular: 'Libre',
    chip: 'data-[active=true]:border-emerald-300 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-900',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    bar: 'bg-emerald-400',
    dot: 'bg-emerald-500',
  },
  ASIGNADO: {
    label: 'Asignados',
    singular: 'Asignado',
    chip: 'data-[active=true]:border-sky-300 data-[active=true]:bg-sky-50 data-[active=true]:text-sky-900',
    badge: 'border-sky-200 bg-sky-50 text-sky-800',
    bar: 'bg-sky-500',
    dot: 'bg-sky-500',
  },
  ATENDIDO: {
    label: 'Atendidos',
    singular: 'Atendido',
    chip: 'data-[active=true]:border-violet-300 data-[active=true]:bg-violet-50 data-[active=true]:text-violet-900',
    badge: 'border-violet-200 bg-violet-50 text-violet-800',
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
  },
  CANCELADO: {
    label: 'Cancelados',
    singular: 'Cancelado',
    chip: 'data-[active=true]:border-slate-300 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900',
    badge: 'border-slate-200 bg-slate-100 text-slate-600',
    bar: 'bg-slate-300',
    dot: 'bg-slate-400',
  },
};

const STATUS_ORDER: SlotStatus[] = ['LIBRE', 'ASIGNADO', 'ATENDIDO', 'CANCELADO'];

function useDebounced<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

export default function AgendaSlotsBoard({
  canCancel,
  modalityId,
}: {
  canCancel: boolean;
  modalityId: number | null;
}) {
  const queryClient = useQueryClient();
  const [today] = useState(() => todayInAgendaZone());
  const [range, setRange] = useState(() => presetRange(DEFAULT_PRESET, today));
  const [doctorId, setDoctorId] = useState('all');
  const [statuses, setStatuses] = useState<SlotStatus[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounced(searchInput.trim());
  const [selection, setSelection] = useState<{ key: string; ids: ReadonlySet<number> }>({ key: '', ids: new Set() });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [restoreTarget, setRestoreTarget] = useState<AgendaSlotRow | null>(null);

  // El preset activo se deduce del rango: si coincide con uno, ese botón se marca.
  const activePreset: DatePresetId =
    DATE_PRESETS.find((item) => {
      const candidate = presetRange(item.id, today);
      return candidate.desde === range.desde && candidate.hasta === range.hasta;
    })?.id ?? 'personalizado';
  const rangeError =
    range.desde && range.hasta && differenceInCalendarDays(range.desde, range.hasta) > MAX_RANGE_DAYS
      ? `El rango no puede superar ${MAX_RANGE_DAYS + 1} días.`
      : '';
  const filters = { ...range, modalityId, doctorId, statuses, search };

  const query = useInfiniteQuery<SlotsResponse>({
    queryKey: ['agenda-slots', filters],
    // Mientras se elige la segunda fecha del rango, se siguen mostrando los resultados anteriores.
    enabled: Boolean(range.desde && range.hasta) && !rangeError,
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        desde: range.desde,
        hasta: range.hasta,
        page: String(pageParam),
        pageSize: String(PAGE_SIZE),
      });
      if (modalityId) params.set('modalidadId', String(modalityId));
      if (doctorId !== 'all') params.set('medicoId', doctorId);
      if (statuses.length > 0) params.set('estado', statuses.join(','));
      if (search) params.set('q', search);
      return agendaRequest(`/api/agenda/cupos?${params.toString()}`);
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

  // La selección pertenece a los filtros con que se hizo: al cambiarlos deja de ser visible y se descarta.
  const filtersKey = JSON.stringify(filters);
  const selected = selection.key === filtersKey ? selection.ids : EMPTY_SELECTION;
  function setSelected(update: ReadonlySet<number> | ((current: ReadonlySet<number>) => ReadonlySet<number>)) {
    setSelection((current) => {
      const base = current.key === filtersKey ? current.ids : EMPTY_SELECTION;
      return { key: filtersKey, ids: typeof update === 'function' ? update(base) : update };
    });
  }

  const firstPage = query.data?.pages[0];
  const slots = useMemo(() => query.data?.pages.flatMap((page) => page.rows) ?? [], [query.data]);
  const groups = useMemo(() => groupSlotsByDay(slots), [slots]);
  const total = firstPage?.total ?? 0;
  const counts = firstPage?.conteos;
  const countsTotal = counts ? STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0) : 0;
  const availableLoadedIds = useMemo(
    () => slots.filter((slot) => slot.estado === 'LIBRE').map((slot) => slot.id),
    [slots],
  );
  const selectedIds = useMemo(
    () => availableLoadedIds.filter((slotId) => selected.has(slotId)),
    [availableLoadedIds, selected],
  );
  const hasActiveFilters = doctorId !== 'all' || statuses.length > 0 || searchInput.trim() !== '' || activePreset !== DEFAULT_PRESET;

  const restoration = useMutation<{ cupo: { id: number; inicio: string } }, Error, { cupoId: number; motivo: string }>({
    mutationFn: (body) =>
      agendaRequest('/api/agenda/cupos/restaurar', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: async (data) => {
      setMessage(`Se revirtió la cancelación: el cupo de las ${formatTime(data.cupo.inicio)} vuelve a estar libre.`);
      setRestoreTarget(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['agenda-slots'] }),
        queryClient.invalidateQueries({ queryKey: ['agenda-generation'] }),
      ]);
    },
  });

  const cancellation = useMutation<{ cancelados: number; omitidos: number }, Error, { cupoIds: number[]; motivo: string }>({
    mutationFn: async ({ cupoIds, motivo }) => {
      let cancelados = 0;
      let omitidos = 0;
      for (const batch of chunk(cupoIds, CANCEL_BATCH_SIZE)) {
        const result = await agendaRequest<{ cancelados: number; omitidos: number }>('/api/agenda/cupos/cancelar', {
          method: 'POST',
          body: JSON.stringify({ cupoIds: batch, motivo }),
        });
        cancelados += result.cancelados;
        omitidos += result.omitidos;
      }
      return { cancelados, omitidos };
    },
    onSuccess: async (data) => {
      setMessage(
        data.omitidos > 0
          ? `${data.cancelados} cupos cancelados; ${data.omitidos} no se cancelaron porque ya no estaban libres.`
          : `${data.cancelados} cupos cancelados.`,
      );
      setSelected(new Set());
      setCancelDialogOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['agenda-slots'] }),
        queryClient.invalidateQueries({ queryKey: ['agenda-generations'] }),
        queryClient.invalidateQueries({ queryKey: ['agenda-generation'] }),
      ]);
    },
  });

  function applyPreset(next: Exclude<DatePresetId, 'personalizado'>) {
    setRange(presetRange(next, today));
  }

  function changeRange(field: 'desde' | 'hasta', value: string) {
    setRange((current) => {
      const next = { ...current, [field]: value };
      // La agenda siempre consulta un rango: al limpiar las fechas vuelve al periodo por defecto.
      return next.desde || next.hasta ? next : presetRange(DEFAULT_PRESET, today);
    });
  }

  function toggleStatus(status: SlotStatus) {
    setStatuses((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
    );
  }

  function toggleIds(ids: number[], checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const slotId of ids) {
        if (checked) next.add(slotId);
        else next.delete(slotId);
      }
      return next;
    });
  }

  function clearFilters() {
    applyPreset(DEFAULT_PRESET);
    setDoctorId('all');
    setStatuses([]);
    setSearchInput('');
  }

  function openRestoreDialog(slot: AgendaSlotRow) {
    restoration.reset();
    setMessage('');
    setRestoreTarget(slot);
  }

  function handleRestoreDialogOpenChange(open: boolean) {
    if (restoration.isPending) return;
    if (!open) {
      setRestoreTarget(null);
      restoration.reset();
    }
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

  const allLoadedSelected =
    availableLoadedIds.length > 0 && availableLoadedIds.every((slotId) => selected.has(slotId));

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 sm:items-end lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="agenda-slots-search" className="text-[11px] font-medium text-slate-600">
                Buscar
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <Input
                  id="agenda-slots-search"
                  type="search"
                  value={searchInput}
                  maxLength={80}
                  placeholder="Médico, paciente o documento"
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="h-10 rounded-md border-slate-300 bg-white pl-10 pr-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500/60"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="agenda-slots-doctor" className="text-[11px] font-medium text-slate-600">
                Médico
              </Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger
                  id="agenda-slots-doctor"
                  className="h-10 rounded-md border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-sky-500/60"
                >
                  <SelectValue placeholder="Todos los médicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los médicos</SelectItem>
                  {firstPage?.medicos.map((doctor) => (
                    <SelectItem key={doctor.id} value={String(doctor.id)}>
                      {doctor.nombre} · {doctor.total}
                    </SelectItem>
                  ))}
                  {doctorId !== 'all' && !firstPage?.medicos.some((doctor) => String(doctor.id) === doctorId) ? (
                    <SelectItem value={doctorId}>Médico seleccionado</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            <DateRangePicker
              from={range.desde}
              to={range.hasta}
              onFromChange={(value) => changeRange('desde', value)}
              onToChange={(value) => changeRange('hasta', value)}
              align="right"
            />
          </div>
          {rangeError ? <p role="alert" className="text-sm text-rose-700">{rangeError}</p> : null}

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Periodo rápido">
            <span className="mr-1 text-[11px] font-medium text-slate-600">Periodo rápido</span>
            {DATE_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={activePreset === item.id}
                onClick={() => applyPreset(item.id)}
                className={cn(
                  'min-h-9 rounded-full border px-3.5 text-sm font-medium transition-colors',
                  activePreset === item.id
                    ? 'border-sky-600 bg-sky-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
              <button
                type="button"
                data-active={statuses.length === 0}
                aria-pressed={statuses.length === 0}
                onClick={() => setStatuses([])}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 data-[active=true]:border-slate-800 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
              >
                Todos
                <span className="tabular-nums opacity-80">{countsTotal}</span>
              </button>
              {STATUS_ORDER.map((status) => {
                const active = statuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    data-active={active}
                    aria-pressed={active}
                    onClick={() => toggleStatus(status)}
                    className={cn(
                      'inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50',
                      STATUS_META[status].chip,
                    )}
                  >
                    <span className={cn('h-2 w-2 rounded-full', STATUS_META[status].dot)} aria-hidden="true" />
                    {STATUS_META[status].label}
                    <span className="tabular-nums opacity-70">{counts?.[status] ?? 0}</span>
                  </button>
                );
              })}
            </div>

            {hasActiveFilters ? (
              <Button type="button" variant="ghost" onClick={clearFilters} className="min-h-9 self-start text-slate-600 md:self-auto">
                <FilterX className="h-4 w-4" aria-hidden="true" /> Limpiar filtros
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {message ? (
        <div role="status" aria-live="polite" className="flex items-start justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          {message}
          <button type="button" onClick={() => setMessage('')} aria-label="Cerrar mensaje" className="text-sky-700 hover:text-sky-900">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <Card className="border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p aria-live="polite" className="text-sm text-slate-600">
            {query.isLoading ? (
              'Buscando cupos…'
            ) : (
              <>
                <span className="font-semibold tabular-nums text-slate-900">{total}</span> cupos
                {slots.length < total ? <> · mostrando <span className="tabular-nums">{slots.length}</span></> : null}
                {query.isFetching && !query.isFetchingNextPage ? (
                  <LoaderCircle className="ml-2 inline h-4 w-4 animate-spin text-sky-600 motion-reduce:animate-none" aria-label="Actualizando" />
                ) : null}
              </>
            )}
          </p>
          {canCancel && availableLoadedIds.length > 0 ? (
            <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={allLoadedSelected}
                onCheckedChange={(value) => toggleIds(availableLoadedIds, value === true)}
                aria-label="Seleccionar todos los cupos libres mostrados"
                className="h-5 w-5"
              />
              Seleccionar libres mostrados
            </label>
          ) : null}
        </div>

        <CardContent className="p-0">
          {query.isLoading ? (
            <div className="space-y-3 p-4 sm:p-5" aria-label="Cargando cupos">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
              ))}
            </div>
          ) : query.isError ? (
            <div role="alert" className="m-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 sm:m-5">
              <p>{query.error instanceof Error ? query.error.message : 'No se pudieron cargar los cupos.'}</p>
              <Button type="button" variant="outline" onClick={() => query.refetch()} className="mt-4 min-h-11">
                <RefreshCw aria-hidden="true" /> Reintentar
              </Button>
            </div>
          ) : slots.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <CalendarSearch className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-slate-900">No hay cupos con estos filtros</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Prueba con otro periodo, otro médico o quita la búsqueda.
              </p>
              {hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={clearFilters} className="mt-5 min-h-11">
                  <FilterX aria-hidden="true" /> Limpiar filtros
                </Button>
              ) : null}
            </div>
          ) : (
            <div>
              {groups.map((group) => {
                const dayAvailableIds = group.slots.filter((slot) => slot.estado === 'LIBRE').map((slot) => slot.id);
                const daySelected = dayAvailableIds.length > 0 && dayAvailableIds.every((slotId) => selected.has(slotId));
                return (
                  <section key={group.date} aria-labelledby={`agenda-day-${group.date}`}>
                    <div className="sticky top-16 z-10 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-y border-slate-100 bg-slate-50/95 px-4 py-2.5 backdrop-blur sm:px-5 lg:top-0">
                      <div className="flex min-w-0 items-center gap-3">
                        {canCancel && dayAvailableIds.length > 0 ? (
                          <Checkbox
                            checked={daySelected}
                            onCheckedChange={(value) => toggleIds(dayAvailableIds, value === true)}
                            aria-label={`Seleccionar los cupos libres del ${formatDayHeading(group.date)}`}
                            className="h-5 w-5"
                          />
                        ) : null}
                        <CalendarDays className="h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
                        <h3 id={`agenda-day-${group.date}`} className="text-sm font-semibold text-slate-900">
                          {formatDayHeading(group.date)}
                          {group.date === today ? (
                            <span className="ml-2 rounded-full bg-sky-600 px-2 py-0.5 text-[11px] font-semibold text-white">Hoy</span>
                          ) : null}
                        </h3>
                      </div>
                      <p className="shrink-0 text-xs tabular-nums text-slate-500">
                        {group.slots.length} cupos · <span className="text-emerald-700">{group.available} libres</span>
                      </p>
                    </div>

                    <ul className="divide-y divide-slate-100">
                      {group.slots.map((slot) => {
                        const isSelected = selected.has(slot.id);
                        const meta = STATUS_META[slot.estado];
                        return (
                          <li
                            key={slot.id}
                            className={cn(
                              'relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 py-3 pl-5 pr-4 transition-colors sm:pr-5 md:grid-cols-[auto_7.5rem_minmax(0,1.2fr)_minmax(0,1fr)_auto]',
                              isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50/70',
                              slot.estado === 'CANCELADO' && 'text-slate-400',
                            )}
                          >
                            <span className={cn('absolute inset-y-2 left-0 w-1 rounded-r-full', meta.bar)} aria-hidden="true" />
                            <span className="flex w-5 justify-center">
                              {canCancel && slot.estado === 'LIBRE' ? (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(value) => toggleIds([slot.id], value === true)}
                                  aria-label={`Seleccionar cupo de ${slot.medicoNombre} a las ${formatTime(slot.inicio)}`}
                                  className="h-5 w-5"
                                />
                              ) : null}
                            </span>

                            <span className="text-sm font-semibold tabular-nums text-slate-900 md:col-auto">
                              {formatTime(slot.inicio)}
                              <span className="font-normal text-slate-400"> – {formatTime(slot.fin)}</span>
                            </span>

                            <span className="flex items-center gap-2 justify-self-end md:order-last">
                              {canCancel && slot.estado === 'CANCELADO' && new Date(slot.inicio) > new Date() ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openRestoreDialog(slot)}
                                  aria-label={`Revertir cancelación del cupo de ${slot.medicoNombre} a las ${formatTime(slot.inicio)}`}
                                  className="h-8 rounded-full border-emerald-200 px-3 text-xs font-medium text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Revertir
                                </Button>
                              ) : null}
                              <span
                                className={cn(
                                  'inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
                                  meta.badge,
                                )}
                              >
                                {STATUS_META[slot.estado].singular}
                              </span>
                            </span>

                            <span className="col-span-2 col-start-2 flex min-w-0 items-center gap-2.5 md:col-span-1 md:col-start-auto">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-800">
                                {initials(slot.medicoNombre)}
                              </span>
                              <span className="min-w-0 truncate text-sm font-medium text-slate-800">{slot.medicoNombre}</span>
                            </span>

                            <span className="col-span-2 col-start-2 min-w-0 md:col-span-1 md:col-start-auto">
                              {slot.paciente ? (
                                <span className="flex min-w-0 items-center gap-2">
                                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm text-slate-800">{slot.paciente.nombre}</span>
                                    <span className="block text-xs tabular-nums text-slate-500">Doc. {slot.paciente.documento}</span>
                                  </span>
                                </span>
                              ) : (
                                <span className="text-sm text-slate-400">Sin paciente</span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}

              {query.hasNextPage ? (
                <div className="flex justify-center border-t border-slate-100 p-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => query.fetchNextPage()}
                    disabled={query.isFetchingNextPage}
                    className="min-h-11 rounded-xl"
                  >
                    {query.isFetchingNextPage ? (
                      <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    ) : (
                      <ChevronDown aria-hidden="true" />
                    )}
                    Cargar más ({total - slots.length} restantes)
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {canCancel && selectedIds.length > 0 ? (
        <div className="sticky bottom-4 z-20 flex justify-center">
          <div
            role="region"
            aria-label="Acciones de selección"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-900 py-2 pl-4 pr-2 text-white shadow-xl"
          >
            <span className="text-sm tabular-nums">
              {selectedIds.length} {selectedIds.length === 1 ? 'cupo seleccionado' : 'cupos seleccionados'}
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelected(new Set())}
              className="min-h-10 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              Quitar selección
            </Button>
            <Button
              type="button"
              onClick={openCancelDialog}
              disabled={cancellation.isPending}
              className="min-h-10 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              <Ban aria-hidden="true" /> Bloquear cupos
            </Button>
          </div>
        </div>
      ) : null}

      <RestoreSlotDialog
        slot={restoreTarget}
        errorMessage={restoration.error?.message}
        isPending={restoration.isPending}
        onConfirm={(motivo) => restoreTarget && restoration.mutate({ cupoId: restoreTarget.id, motivo })}
        onOpenChange={handleRestoreDialogOpenChange}
      />

      <CancelSlotsDialog
        count={selectedIds.length}
        errorMessage={cancellation.error?.message}
        isPending={cancellation.isPending}
        onConfirm={(motivo) => cancellation.mutate({ cupoIds: selectedIds, motivo })}
        onOpenChange={handleCancelDialogOpenChange}
        open={cancelDialogOpen}
      />
    </div>
  );
}
