import { CalendarX2 } from 'lucide-react';
import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';

import type { EffectiveWorkSchedule } from '@/features/agenda/domain/types';
import {
  formatAgendaDate,
  parseLocalDateOnly,
  toDateOnly,
} from './agenda-creation-date';
import { defaultBlocksForDate } from './agenda-doctor-date-schedule';
import type { AgendaHoliday } from './useAgendaHolidays';

type AgendaDoctorScheduleCalendarProps = {
  calendarId: string;
  schedule: EffectiveWorkSchedule;
  periodDates: string[];
  selectedDate: string;
  customizedDates: string[];
  excludedDates: string[];
  holidays: AgendaHoliday[];
  holidayError?: string;
  onDateSelect: (date: string) => void;
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function dateObjects(values: string[]) {
  return values
    .map(parseLocalDateOnly)
    .filter((date): date is Date => Boolean(date));
}

export function AgendaDoctorScheduleCalendar({
  calendarId,
  schedule,
  periodDates,
  selectedDate,
  customizedDates,
  excludedDates,
  holidays,
  holidayError,
  onDateSelect,
}: AgendaDoctorScheduleCalendarProps) {
  const holidaysByDate = useMemo(
    () => new Map(holidays.map((holiday) => [holiday.date, holiday])),
    [holidays],
  );
  const customized = useMemo(() => new Set(customizedDates), [customizedDates]);
  const nonWorkingDates = periodDates.filter(
    (date) =>
      !customized.has(date) && defaultBlocksForDate(schedule, date).length === 0,
  );
  const periodStart = parseLocalDateOnly(periodDates[0]);
  const periodEnd = parseLocalDateOnly(periodDates.at(-1) ?? '');
  const selectedDateObject = parseLocalDateOnly(selectedDate);

  return (
    <section
      aria-labelledby={calendarId}
      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3"
    >
      <div className="px-1">
        <h3 id={calendarId} className="text-sm font-semibold text-slate-900">
          Selecciona una fecha
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Revisa festivos y personaliza las horas del día.
        </p>
      </div>

      {periodStart && periodEnd ? (
        <DayPicker
          mode="single"
          selected={selectedDateObject}
          onSelect={(date) => {
            if (date) onDateSelect(toDateOnly(date));
          }}
          defaultMonth={selectedDateObject ?? periodStart}
          startMonth={periodStart}
          endMonth={periodEnd}
          disabled={[{ before: periodStart }, { after: periodEnd }]}
          modifiers={{
            customized: dateObjects(customizedDates),
            holiday: dateObjects(holidays.map((item) => item.date)),
            excluded: dateObjects(excludedDates),
            nonWorking: dateObjects(nonWorkingDates),
          }}
          modifiersClassNames={{
            customized: 'agenda-day-customized',
            holiday: 'agenda-day-holiday',
            excluded: 'agenda-date-excluded',
            nonWorking: 'agenda-day-non-working',
          }}
          locale={es}
          lang="es-CO"
          navLayout="around"
          showOutsideDays={false}
          className="date-range-day-picker doctor-schedule-day-picker"
          labels={{
            labelDayButton: (date, modifiers) => {
              const value = toDateOnly(date);
              const details = [formatAgendaDate(value)];
              const holiday = holidaysByDate.get(value);
              if (modifiers.selected) details.push('seleccionada');
              if (holiday) details.push(`festivo: ${holiday.name}`);
              if (modifiers.customized) details.push('horario personalizado');
              if (modifiers.excluded) details.push('fecha excluida');
              if (modifiers.nonWorking) details.push('sin atención');
              return details.join(', ');
            },
          }}
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
      ) : (
        <p className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-600">
          Selecciona primero un periodo válido para la agenda.
        </p>
      )}

      <div
        aria-label="Leyenda del calendario"
        className="mt-3 flex flex-wrap gap-x-3 gap-y-2 border-t border-slate-200 px-1 pt-3 text-[11px] font-medium text-slate-600"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-600" aria-hidden="true" />
          Personalizada
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden="true" />
          Festivo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarX2 className="h-3.5 w-3.5 text-rose-700" aria-hidden="true" />
          Excluida
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full border border-slate-400"
            aria-hidden="true"
          />
          Sin atención
        </span>
      </div>

      {holidayError ? (
        <p role="status" className="mt-3 text-xs leading-5 text-amber-800">
          {holidayError}
        </p>
      ) : null}
    </section>
  );
}
