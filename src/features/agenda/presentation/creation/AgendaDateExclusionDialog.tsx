'use client';

import {
  CalendarCheck2,
  CalendarMinus2,
  CalendarOff,
  Landmark,
  LoaderCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { isoDayOfWeek } from '@/features/agenda/domain/date-time';
import type { DoctorDateScheduleOverride } from '@/features/agenda/domain/types';
import { formatAgendaDate, formatAgendaDateShort } from './agenda-creation-date';
import type { AgendaHoliday } from './useAgendaHolidays';

type AgendaDateExclusionDialogProps = {
  periodDates: string[];
  excludedDates: string[];
  doctorScheduleOverrides: Record<number, DoctorDateScheduleOverride[]>;
  enabledAutomaticDates: string[];
  holidays: AgendaHoliday[];
  holidaysLoading?: boolean;
  holidaysError?: string;
  onExcludedDateChange: (date: string, excluded: boolean) => void;
  onAutomaticDateChange: (date: string, enabled: boolean) => void;
  evaluatedDefaultWorkDates?: string[];
  workDatesLoading?: boolean;
  workDatesError?: string;
  onRetryWorkDates?: () => void;
  error?: string;
  disabled?: boolean;
};

function markedCountLabel(count: number) {
  return `${count} ${count === 1 ? 'marcada' : 'marcadas'}`;
}

export function AgendaDateExclusionDialog({
  periodDates,
  excludedDates,
  doctorScheduleOverrides,
  enabledAutomaticDates,
  holidays,
  holidaysLoading = false,
  holidaysError,
  onExcludedDateChange,
  onAutomaticDateChange,
  evaluatedDefaultWorkDates,
  workDatesLoading = false,
  workDatesError,
  onRetryWorkDates,
  error,
  disabled = false,
}: AgendaDateExclusionDialogProps) {
  const [open, setOpen] = useState(false);
  const holidayByDate = useMemo(
    () => new Map(holidays.map((holiday) => [holiday.date, holiday.name])),
    [holidays],
  );
  const defaultWorkDateSet = useMemo(
    () =>
      evaluatedDefaultWorkDates
        ? new Set(evaluatedDefaultWorkDates)
        : undefined,
    [evaluatedDefaultWorkDates],
  );
  const defaultClosedDates = useMemo(
    () =>
      new Set(
        periodDates.filter((date) =>
          defaultWorkDateSet
            ? !defaultWorkDateSet.has(date)
            : isoDayOfWeek(date) >= 6,
        ),
      ),
    [defaultWorkDateSet, periodDates],
  );
  const customizedDates = useMemo(
    () =>
      new Set(
        Object.values(doctorScheduleOverrides).flatMap((dates) =>
          dates.map((item) => item.fecha),
        ),
      ),
    [doctorScheduleOverrides],
  );
  const explicitlyEnabledDates = useMemo(
    () => new Set(enabledAutomaticDates),
    [enabledAutomaticDates],
  );
  const automaticClosedDates = useMemo(
    () =>
      new Set([
        ...defaultClosedDates,
        ...holidays.map((holiday) => holiday.date),
      ]),
    [defaultClosedDates, holidays],
  );
  const markedDates = useMemo(
    () =>
      new Set([
        ...excludedDates,
        ...[...automaticClosedDates].filter(
          (date) =>
            !customizedDates.has(date) &&
            !explicitlyEnabledDates.has(date),
        ),
      ]),
    [
      automaticClosedDates,
      customizedDates,
      excludedDates,
      explicitlyEnabledDates,
    ],
  );
  const countLabel = markedCountLabel(markedDates.size);

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="inline-flex items-center gap-2">
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled}
              title="Configurar fechas sin cupos"
              aria-label={`Configurar fechas sin cupos: ${countLabel}`}
              aria-describedby={error ? 'agenda-exclusions-trigger-error' : undefined}
              className="h-11 w-11 rounded-full border-slate-200 bg-white text-sky-700 shadow-none hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
            >
              <CalendarMinus2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <span
            aria-live="polite"
            className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs tabular-nums text-slate-600"
          >
            {countLabel}
          </span>
        </div>

        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border-slate-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-5 py-5 pr-14 sm:px-6">
            <DialogTitle className="flex items-center gap-2 text-left text-lg text-slate-950">
              <CalendarMinus2 className="h-5 w-5 text-sky-700" aria-hidden="true" />
              Fechas sin cupos
            </DialogTitle>
            <DialogDescription className="text-left leading-5 text-slate-600">
              Las fechas marcadas no generan cupos. Los días sin horario y los
              festivos se marcan automáticamente; puedes desmarcarlos directamente.
            </DialogDescription>
          </DialogHeader>

          <fieldset disabled={disabled} className="min-h-0 px-5 py-4 sm:px-6">
            <legend className="sr-only">
              Fechas que no generarán cupos para los médicos
            </legend>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-800">
                Desmarca una fecha para habilitarla
              </p>
              <span
                aria-live="polite"
                className="rounded-full bg-sky-50 px-2.5 py-1 text-xs tabular-nums text-sky-800"
              >
                {countLabel}
              </span>
            </div>

            {workDatesLoading || holidaysLoading ? (
              <p className="mb-3 flex items-center gap-2 text-xs text-slate-600" role="status">
                <LoaderCircle
                  className="h-4 w-4 animate-spin text-sky-700 motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Revisando horarios y festivos del periodo…
              </p>
            ) : null}

            {workDatesError || holidaysError ? (
              <div
                role="alert"
                className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
              >
                <span>
                  {workDatesError
                    ? 'No se pudieron identificar todos los días no laborables.'
                    : holidaysError}
                </span>
                {workDatesError && onRetryWorkDates ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-9 text-amber-900 hover:bg-amber-100"
                    onClick={onRetryWorkDates}
                  >
                    Reintentar
                  </Button>
                ) : null}
              </div>
            ) : null}

            <div className="grid max-h-[min(56dvh,28rem)] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {periodDates.map((date) => {
                const excluded = excludedDates.includes(date);
                const noDefaultWork = defaultClosedDates.has(date);
                const holidayName = holidayByDate.get(date);
                const automatic = automaticClosedDates.has(date);
                const automaticEnabled =
                  automatic &&
                  (customizedDates.has(date) ||
                    explicitlyEnabledDates.has(date));
                const needsHours =
                  automaticEnabled &&
                  noDefaultWork &&
                  !customizedDates.has(date);
                const checked =
                  excluded || (automatic && !automaticEnabled);
                const accessibleAction = checked
                  ? automatic && !automaticEnabled
                    ? `Habilitar ${formatAgendaDate(date)}`
                    : `Incluir nuevamente ${formatAgendaDate(date)}`
                  : automatic
                    ? `Volver a marcar ${formatAgendaDate(date)} como no disponible`
                    : `Excluir ${formatAgendaDate(date)}`;

                return (
                  <label
                    key={date}
                    className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                      checked
                        ? automatic
                          ? 'border-slate-300 bg-slate-100 text-slate-700 hover:border-sky-300'
                          : 'border-sky-300 bg-sky-50 text-sky-950'
                        : automaticEnabled
                          ? needsHours
                            ? 'border-amber-200 bg-amber-50/70 text-slate-800 hover:border-amber-300'
                            : 'border-emerald-200 bg-emerald-50/70 text-slate-800 hover:border-emerald-300'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-sky-300'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        const nextChecked = value === true;
                        if (!automatic) {
                          onExcludedDateChange(date, nextChecked);
                          return;
                        }
                        onAutomaticDateChange(date, !nextChecked);
                      }}
                      aria-label={accessibleAction}
                      className="h-5 w-5"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block capitalize">
                        {formatAgendaDateShort(date)}
                      </span>
                      {automatic ? (
                        <span className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs font-medium">
                          {noDefaultWork ? (
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <CalendarOff className="h-3.5 w-3.5" aria-hidden="true" />
                              No laborable
                            </span>
                          ) : null}
                          {holidayName ? (
                            <span className="inline-flex items-center gap-1 text-amber-800">
                              <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                              Festivo: {holidayName}
                            </span>
                          ) : null}
                          {automaticEnabled ? (
                            <span
                              className={`inline-flex items-center gap-1 ${
                                needsHours ? 'text-amber-800' : 'text-emerald-800'
                              }`}
                            >
                              <CalendarCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                              {needsHours
                                ? 'Habilitada · configura horas por médico'
                                : 'Habilitada'}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <DialogClose asChild>
              <Button
                type="button"
                className="min-h-11 bg-sky-700 px-5 text-white hover:bg-sky-800"
              >
                Listo
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error ? (
        <p
          id="agenda-exclusions-trigger-error"
          role="alert"
          className="text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
