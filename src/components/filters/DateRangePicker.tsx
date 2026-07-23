'use client';

import { format } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { es } from 'react-day-picker/locale';

type Props = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  className?: string;
};

function parseDateOnly(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDateOnly(value: Date): string {
  return format(value, 'yyyy-MM-dd');
}

function formatDisplay(value: string): string {
  const date = parseDateOnly(value);
  return date ? format(date, 'dd/MM/yyyy') : 'dd/mm/aaaa';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo<DateRange | undefined>(() => {
    const selectedFrom = parseDateOnly(from);
    const selectedTo = parseDateOnly(to);
    return selectedFrom ? { from: selectedFrom, to: selectedTo } : undefined;
  }, [from, to]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const clear = () => {
    onFromChange('');
    onToChange('');
    setOpen(false);
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      onFromChange('');
      onToChange('');
      return;
    }

    onFromChange(toDateOnly(range.from));
    onToChange(range.to ? toDateOnly(range.to) : '');
    if (range.to) setOpen(false);
  };

  const defaultMonth = selected?.from ?? new Date();
  const fromLabel = formatDisplay(from);
  const toLabel = formatDisplay(to);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <span className="block text-[11px] font-medium text-slate-600">Rango de fechas</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Rango de fechas: desde ${fromLabel}, hasta ${toLabel}`}
        className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-left text-xs shadow-sm transition-colors hover:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/60"
      >
        <span className="flex min-w-0 items-center gap-2 tabular-nums">
          <span className={from ? 'text-slate-800' : 'text-slate-400'}>
            {fromLabel}
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className={to ? 'text-slate-800' : 'text-slate-400'}>
            {toLabel}
          </span>
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Seleccionar rango de fechas"
          className="absolute left-0 top-full z-50 mt-2 w-[min(44rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-5"
        >
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            resetOnSelect
            numberOfMonths={desktop ? 2 : 1}
            pagedNavigation
            navLayout="around"
            defaultMonth={defaultMonth}
            locale={es}
            lang="es-CO"
            showOutsideDays={false}
            autoFocus
            className="date-range-day-picker"
            formatters={{
              formatCaption: (month) =>
                capitalize(format(month, 'LLLL yyyy', { locale: es })),
              formatWeekdayName: (day) =>
                capitalize(format(day, 'EEEEEE', { locale: es }).replace('.', '')),
            }}
          />

          {from || to ? (
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={clear}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Limpiar fechas
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
