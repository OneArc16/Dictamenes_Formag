import {
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  ChevronDown,
  Clock3,
  LoaderCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconTooltip } from '@/components/ui/icon-tooltip';
import { cn } from '@/lib/utils';
import { formatAgendaDateShort } from './agenda-creation-date';
import type { AgendaDoctorDateSchedule } from './agenda-creation-work-dates';

const INITIAL_VISIBLE_DATES = 6;

type DoctorScheduleSummaryProps = {
  doctorId: number;
  doctorName: string;
  schedules?: AgendaDoctorDateSchedule[];
  globallyExcludedDates: string[];
  doctorExcludedDates: string[];
  onExcludedDateChange?: (date: string, excluded: boolean) => void;
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
};

function ScheduleDateItem({
  schedule,
  doctorId,
  globallyExcluded,
  doctorExcluded,
  doctorName,
  onExcludedDateChange,
  disabled = false,
}: {
  schedule: AgendaDoctorDateSchedule;
  doctorId: number;
  globallyExcluded: boolean;
  doctorExcluded: boolean;
  doctorName: string;
  onExcludedDateChange?: (date: string, excluded: boolean) => void;
  disabled?: boolean;
}) {
  const excluded = globallyExcluded || doctorExcluded;
  const canToggle = Boolean(onExcludedDateChange) && !globallyExcluded;
  const tooltipId = `agenda-doctor-date-exclusion-${doctorId}-${schedule.date}`;
  const actionLabel = doctorExcluded
    ? `Incluir ${formatAgendaDateShort(schedule.date)} para ${doctorName}`
    : `Excluir ${formatAgendaDateShort(schedule.date)} para ${doctorName}`;

  return (
    <li
      className={cn(
        'min-w-0 rounded-lg border px-2.5 py-1.5',
        excluded
          ? 'border-rose-200 bg-rose-50/70 text-rose-900'
          : 'border-slate-200 bg-slate-50/80 text-slate-800',
      )}
    >
      <div className="flex min-w-0 items-start gap-1">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'truncate text-xs font-semibold capitalize',
                excluded ? 'text-rose-800' : 'text-slate-700',
              )}
              title={formatAgendaDateShort(schedule.date)}
            >
              {formatAgendaDateShort(schedule.date)}
            </span>
            {excluded ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-rose-700">
                <CalendarX2 className="h-3.5 w-3.5" aria-hidden="true" />
                {globallyExcluded ? 'General' : 'Excluida'}
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex items-start gap-1.5 text-xs leading-4">
            <Clock3
              className={cn(
                'mt-0.5 h-3.5 w-3.5 shrink-0',
                excluded ? 'text-rose-600' : 'text-sky-700',
              )}
              aria-hidden="true"
            />
            <span className={cn('min-w-0', excluded && 'line-through decoration-rose-400')}>
              {schedule.blocks
                .map((block) => `${block.horaInicio}–${block.horaFin}`)
                .join(' · ')}
            </span>
          </div>
        </div>
        {canToggle ? (
          <IconTooltip id={tooltipId} label={actionLabel} align="right">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={disabled}
              aria-label={actionLabel}
              aria-describedby={tooltipId}
              className={cn(
                'h-11 w-11 shrink-0 rounded-full transition-colors duration-200',
                doctorExcluded
                  ? 'text-sky-700 hover:bg-sky-100 hover:text-sky-800'
                  : 'text-rose-700 hover:bg-rose-100 hover:text-rose-800',
              )}
              onClick={() => onExcludedDateChange?.(schedule.date, !doctorExcluded)}
            >
              {doctorExcluded ? (
                <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <CalendarX2 className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </IconTooltip>
        ) : null}
      </div>
    </li>
  );
}

export function DoctorScheduleSummary({
  doctorId,
  doctorName,
  schedules,
  globallyExcludedDates,
  doctorExcludedDates,
  onExcludedDateChange,
  isLoading = false,
  error,
  disabled = false,
}: DoctorScheduleSummaryProps) {
  const globallyExcluded = new Set(globallyExcludedDates);
  const doctorExcluded = new Set(doctorExcludedDates);
  const visibleSchedules = schedules?.slice(0, INITIAL_VISIBLE_DATES) ?? [];
  const remainingSchedules = schedules?.slice(INITIAL_VISIBLE_DATES) ?? [];
  const activeDates =
    schedules?.filter(
      (schedule) =>
        !globallyExcluded.has(schedule.date) && !doctorExcluded.has(schedule.date),
    ).length ??
    0;

  return (
    <section
      aria-label={`Fechas y horas de ${doctorName}`}
      className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/40 p-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <CalendarClock className="h-4 w-4 text-sky-700" aria-hidden="true" />
          Fechas y horas en el periodo
        </h4>
        {schedules ? (
          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium tabular-nums text-slate-600 shadow-sm ring-1 ring-slate-200">
            {activeDates} {activeDates === 1 ? 'fecha activa' : 'fechas activas'}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="mt-3 flex min-h-11 items-center gap-2 text-sm text-slate-600">
          <LoaderCircle className="h-4 w-4 animate-spin text-sky-700" aria-hidden="true" />
          Consultando horario…
        </p>
      ) : error ? (
        <p role="status" className="mt-3 text-sm leading-5 text-amber-800">
          {error}
        </p>
      ) : schedules?.length === 0 ? (
        <p className="mt-3 text-sm leading-5 text-slate-600">
          Este médico no tiene fechas laborables en el periodo seleccionado.
        </p>
      ) : schedules ? (
        <>
          <ul className="mt-2 grid gap-1.5 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
            {visibleSchedules.map((schedule) => (
              <ScheduleDateItem
                key={schedule.date}
                schedule={schedule}
                doctorId={doctorId}
                globallyExcluded={globallyExcluded.has(schedule.date)}
                doctorExcluded={doctorExcluded.has(schedule.date)}
                doctorName={doctorName}
                onExcludedDateChange={onExcludedDateChange}
                disabled={disabled}
              />
            ))}
          </ul>

          {remainingSchedules.length > 0 ? (
            <details className="group mt-1.5">
              <summary className="flex min-h-9 w-fit cursor-pointer list-none items-center gap-1 rounded-lg px-2 text-xs font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                Ver {remainingSchedules.length}{' '}
                {remainingSchedules.length === 1 ? 'fecha más' : 'fechas más'}
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="mt-1.5 grid gap-1.5 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
                {remainingSchedules.map((schedule) => (
                  <ScheduleDateItem
                    key={schedule.date}
                    schedule={schedule}
                    doctorId={doctorId}
                    globallyExcluded={globallyExcluded.has(schedule.date)}
                    doctorExcluded={doctorExcluded.has(schedule.date)}
                    doctorName={doctorName}
                    onExcludedDateChange={onExcludedDateChange}
                    disabled={disabled}
                  />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm leading-5 text-slate-500">
          Selecciona un rango válido para visualizar las fechas y horas.
        </p>
      )}
    </section>
  );
}
