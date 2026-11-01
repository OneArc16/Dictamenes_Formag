'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarClock,
  LoaderCircle,
  RotateCcw,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconTooltip } from '@/components/ui/icon-tooltip';
import type {
  DoctorDateScheduleOverride,
  EffectiveWorkSchedule,
  TimeBlock,
} from '@/features/agenda/domain/types';
import {
  dateScheduleOverridesSchema,
  validationMessage,
} from '@/features/agenda/domain/validation';
import { agendaRequest } from '@/features/agenda/presentation/api-client';
import {
  copyDateOverrides,
  defaultBlocksForDate,
  upsertDateOverride,
} from './agenda-doctor-date-schedule';
import { AgendaDoctorDateEditor } from './AgendaDoctorDateEditor';
import { AgendaDoctorScheduleCalendar } from './AgendaDoctorScheduleCalendar';
import { useAgendaHolidays } from './useAgendaHolidays';

type AgendaDoctorScheduleDialogProps = {
  siteId: number;
  doctorId: number;
  doctorName: string;
  periodDates: string[];
  globallyExcludedDates: string[];
  doctorExcludedDates: string[];
  override?: DoctorDateScheduleOverride[];
  onChange: (dates?: DoctorDateScheduleOverride[]) => void;
  disabled?: boolean;
};

type ScheduleEditorProps = {
  doctorId: number;
  schedule: EffectiveWorkSchedule;
  periodDates: string[];
  globallyExcludedDates: string[];
  doctorExcludedDates: string[];
  initialDates: DoctorDateScheduleOverride[];
  onSave: (dates?: DoctorDateScheduleOverride[]) => void;
};

function ScheduleEditor({
  doctorId,
  schedule,
  periodDates,
  globallyExcludedDates,
  doctorExcludedDates,
  initialDates,
  onSave,
}: ScheduleEditorProps) {
  const firstWorkingDate =
    periodDates.find(
      (date) => defaultBlocksForDate(schedule, date).length > 0,
    ) ?? periodDates[0];
  const [selectedDate, setSelectedDate] = useState(
    initialDates[0]?.fecha ?? firstWorkingDate ?? '',
  );
  const [dates, setDates] = useState(() => copyDateOverrides(initialDates));
  const [error, setError] = useState('');
  const holidayState = useAgendaHolidays(periodDates, true);

  const datesByValue = useMemo(
    () => new Map(dates.map((item) => [item.fecha, item])),
    [dates],
  );
  const holidaysByDate = useMemo(
    () =>
      new Map(holidayState.holidays.map((holiday) => [holiday.date, holiday])),
    [holidayState.holidays],
  );
  const exclusions = useMemo(
    () => new Set([...globallyExcludedDates, ...doctorExcludedDates]),
    [doctorExcludedDates, globallyExcludedDates],
  );
  const selectedOverride = datesByValue.get(selectedDate);
  const selectedBlocks =
    selectedOverride?.bloques ??
    (selectedDate ? defaultBlocksForDate(schedule, selectedDate) : []);

  const updateSelectedBlocks = (blocks: TimeBlock[]) => {
    if (!selectedDate) return;
    setDates((current) =>
      upsertDateOverride(current, selectedDate, blocks),
    );
    setError('');
  };

  const save = () => {
    if (dates.length === 0) {
      onSave(undefined);
      return;
    }

    const parsed = dateScheduleOverridesSchema.safeParse(dates);
    if (!parsed.success) {
      setError(validationMessage(parsed.error));
      return;
    }

    onSave(
      parsed.data.map((item) => ({
        fecha: item.fecha,
        bloques: item.bloques.map((block) => ({ ...block })),
      })),
    );
  };

  return (
    <>
      <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-900">
          Los cambios se aplican únicamente a las fechas seleccionadas de esta
          agenda. El horario predeterminado “{schedule.nombre}” no se modifica.
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
          >
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
          <AgendaDoctorScheduleCalendar
            calendarId={`doctor-${doctorId}-calendar-title`}
            schedule={schedule}
            periodDates={periodDates}
            selectedDate={selectedDate}
            customizedDates={dates.map((item) => item.fecha)}
            excludedDates={[...exclusions]}
            holidays={holidayState.holidays}
            holidayError={holidayState.error}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setError('');
            }}
          />
          <AgendaDoctorDateEditor
            editorId={`doctor-${doctorId}-date-title`}
            doctorId={doctorId}
            selectedDate={selectedDate}
            blocks={selectedBlocks}
            customized={Boolean(selectedOverride)}
            holidayName={holidaysByDate.get(selectedDate)?.name}
            excluded={exclusions.has(selectedDate)}
            onBlocksChange={updateSelectedBlocks}
            onResetDate={() => {
              setDates((current) =>
                current.filter((item) => item.fecha !== selectedDate),
              );
              setError('');
            }}
          />
        </div>
      </div>

      <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={dates.length === 0}
            className="min-h-11 justify-start text-slate-600"
            onClick={() => {
              setDates([]);
              setError('');
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restablecer todo
          </Button>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium tabular-nums text-slate-600 ring-1 ring-slate-200">
            {dates.length}{' '}
            {dates.length === 1 ? 'fecha modificada' : 'fechas modificadas'}
          </span>
        </div>
        <Button
          type="button"
          className="min-h-11 bg-sky-700 px-5 text-white hover:bg-sky-800"
          onClick={save}
        >
          Aplicar a esta agenda
        </Button>
      </DialogFooter>
    </>
  );
}

export function AgendaDoctorScheduleDialog({
  siteId,
  doctorId,
  doctorName,
  periodDates,
  globallyExcludedDates,
  doctorExcludedDates,
  override,
  onChange,
  disabled = false,
}: AgendaDoctorScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const scheduleQuery = useQuery<{ schedule: EffectiveWorkSchedule }, Error>({
    queryKey: ['agenda-effective-schedule', siteId, doctorId],
    enabled: open,
    queryFn: () =>
      agendaRequest(
        `/api/agenda/medicos/${doctorId}/horario-efectivo?sedeId=${siteId}`,
      ),
    staleTime: 60_000,
    retry: 1,
  });
  const tooltipId = `agenda-doctor-schedule-tooltip-${doctorId}`;
  const unavailable = disabled || periodDates.length === 0;
  const tooltipLabel =
    periodDates.length === 0
      ? 'Selecciona un periodo para personalizar horas'
      : 'Personalizar fechas y horas';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <IconTooltip id={tooltipId} label={tooltipLabel} align="right">
        <DialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={unavailable}
            aria-label={`Personalizar fechas y horas de ${doctorName} solo para esta agenda`}
            aria-describedby={tooltipId}
            className={`h-11 w-11 rounded-full shadow-none transition-colors duration-200 ${
              override?.length
                ? 'border-sky-300 bg-sky-50 text-sky-800 hover:border-sky-400 hover:bg-sky-100'
                : 'border-slate-200 text-sky-700 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-800'
            }`}
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      </IconTooltip>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border-slate-200 bg-white p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 px-5 py-5 pr-14 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-left text-lg text-slate-950">
            <CalendarClock className="h-5 w-5 text-sky-700" aria-hidden="true" />
            Personalizar fechas y horas
          </DialogTitle>
          <DialogDescription className="text-left leading-5 text-slate-600">
            Ajusta días específicos de {doctorName} únicamente para esta agenda.
          </DialogDescription>
        </DialogHeader>

        {scheduleQuery.isLoading ? (
          <div className="flex min-h-52 items-center justify-center gap-2 px-5 text-sm text-slate-600">
            <LoaderCircle
              className="h-5 w-5 animate-spin text-sky-700 motion-reduce:animate-none"
              aria-hidden="true"
            />
            Cargando horario predeterminado…
          </div>
        ) : scheduleQuery.error ? (
          <div className="space-y-3 px-5 py-8 sm:px-6">
            <p role="alert" className="text-sm font-medium text-rose-700">
              {scheduleQuery.error.message}
            </p>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => void scheduleQuery.refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : scheduleQuery.data?.schedule ? (
          <ScheduleEditor
            key={`${doctorId}-${periodDates.join(':')}-${JSON.stringify(override ?? [])}`}
            doctorId={doctorId}
            schedule={scheduleQuery.data.schedule}
            periodDates={periodDates}
            globallyExcludedDates={globallyExcludedDates}
            doctorExcludedDates={doctorExcludedDates}
            initialDates={override ?? []}
            onSave={(dates) => {
              onChange(dates);
              setOpen(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
