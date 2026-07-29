'use client';

import { CalendarDays } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { es } from 'react-day-picker/locale';

import {
  addDateOnlyDays,
  formatAgendaDate,
  formatAgendaDateInput,
  parseLocalDateOnly,
  toDateOnly,
} from './agenda-creation-date';

type AgendaDateSelectorProps = {
  startDate: string;
  endDate: string;
  periodDates: string[];
  onRangeChange: (startDate: string, endDate: string) => void;
  excludedDates: string[];
  today: string;
  maxRangeDays: number;
  evaluatedWorkDates?: string[];
  startError?: string;
  endError?: string;
  disabled?: boolean;
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AgendaDateSelector({
  startDate,
  endDate,
  periodDates,
  onRangeChange,
  excludedDates,
  today,
  maxRangeDays,
  evaluatedWorkDates,
  startError,
  endError,
  disabled = false,
}: AgendaDateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selected = useMemo<DateRange | undefined>(() => {
    const from = parseLocalDateOnly(startDate);
    if (!from) return undefined;
    return {
      from,
      to: parseLocalDateOnly(endDate),
    };
  }, [endDate, startDate]);

  const excludedDateObjects = useMemo(
    () => excludedDates.map(parseLocalDateOnly).filter((date): date is Date => Boolean(date)),
    [excludedDates],
  );

  const nonWorkingDateObjects = useMemo(() => {
    if (!evaluatedWorkDates) return [];
    const evaluated = new Set(evaluatedWorkDates);
    return periodDates
      .filter((date) => !evaluated.has(date))
      .map(parseLocalDateOnly)
      .filter((date): date is Date => Boolean(date));
  }, [evaluatedWorkDates, periodDates]);

  const todayDate = parseLocalDateOnly(today) ?? new Date();
  const maximumEnd = startDate ? addDateOnlyDays(startDate, maxRangeDays - 1) : undefined;
  const startDateLabel = formatAgendaDateInput(startDate);
  const endDateLabel = formatAgendaDateInput(endDate);
  const summary =
    startDate && endDate
      ? `Del ${formatAgendaDate(startDate)} al ${formatAgendaDate(endDate)} · ${periodDates.length} días`
      : startDate
        ? `Fecha inicial: ${formatAgendaDate(startDate)}. Selecciona la fecha final.`
        : 'Selecciona la fecha inicial y la fecha final.';

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      onRangeChange('', '');
      return;
    }
    const nextEndDate = range.to ? toDateOnly(range.to) : '';
    onRangeChange(toDateOnly(range.from), nextEndDate);
    if (nextEndDate) {
      setOpen(false);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  return (
    <section aria-labelledby="agenda-dates-title" className="space-y-4">
      <div>
        <h2 id="agenda-dates-title" className="text-base font-semibold text-slate-950">
          Periodo de la agenda
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          Selecciona un rango inclusivo de hasta {maxRangeDays} días.
        </p>
      </div>

      <fieldset disabled={disabled} className="space-y-4">
        <legend className="sr-only">Seleccionar periodo de la agenda</legend>
        <div ref={pickerRef} className="relative">
          <span className="block text-xs font-medium text-slate-700">Rango de fechas</span>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-haspopup="dialog"
            aria-expanded={open && !disabled}
            aria-controls="agenda-date-range-dialog"
            aria-describedby="agenda-date-range-summary"
            aria-label={`Rango de fechas: desde ${startDateLabel}, hasta ${endDateLabel}`}
            className="mt-1 flex min-h-11 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-left text-sm shadow-sm transition-colors hover:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
          >
            <span className="flex min-w-0 items-center gap-2 tabular-nums">
              <span className={startDate ? 'text-slate-800' : 'text-slate-400'}>
                {startDateLabel}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                |
              </span>
              <span className={endDate ? 'text-slate-800' : 'text-slate-400'}>
                {endDateLabel}
              </span>
            </span>
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          </button>

          {open && !disabled ? (
            <div
              id="agenda-date-range-dialog"
              role="dialog"
              aria-label="Seleccionar rango de fechas para la agenda"
              className="absolute left-0 top-full z-[60] mt-2 w-[min(44rem,calc(100vw-2rem))] max-w-none rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-5"
            >
              <DayPicker
                mode="range"
                selected={selected}
                onSelect={handleSelect}
                max={maxRangeDays}
                resetOnSelect
                excludeDisabled
                numberOfMonths={desktop ? 2 : 1}
                pagedNavigation
                navLayout="around"
                defaultMonth={selected?.from ?? todayDate}
                startMonth={todayDate}
                disabled={[
                  { before: todayDate },
                  ...(selected?.from && !selected.to && maximumEnd
                    ? [{ after: maximumEnd }]
                    : []),
                ]}
                modifiers={{
                  excluded: excludedDateObjects,
                  nonWorking: nonWorkingDateObjects,
                }}
                modifiersClassNames={{
                  excluded: 'agenda-date-excluded',
                  nonWorking: 'agenda-date-non-working',
                }}
                locale={es}
                lang="es-CO"
                showOutsideDays={false}
                autoFocus
                className="date-range-day-picker"
                formatters={{
                  formatCaption: (month) =>
                    capitalize(
                      new Intl.DateTimeFormat('es-CO', {
                        month: 'long',
                        year: 'numeric',
                      }).format(month),
                    ),
                  formatWeekdayName: (day) =>
                    capitalize(
                      new Intl.DateTimeFormat('es-CO', { weekday: 'short' })
                        .format(day)
                        .replace('.', ''),
                    ),
                }}
              />
            </div>
          ) : null}
        </div>

        <div
          id="agenda-date-range-summary"
          aria-live="polite"
          className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-700"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
          <span>{summary}</span>
        </div>

        {startError || endError ? (
          <div role="alert" className="space-y-1 text-sm font-medium text-rose-700">
            {startError ? <p>{startError}</p> : null}
            {endError ? <p>{endError}</p> : null}
          </div>
        ) : null}
      </fieldset>
    </section>
  );
}
