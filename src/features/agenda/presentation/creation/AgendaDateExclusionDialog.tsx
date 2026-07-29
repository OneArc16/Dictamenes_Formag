'use client';

import { CalendarMinus2, CalendarOff, LoaderCircle } from 'lucide-react';

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
import { formatAgendaDate, formatAgendaDateShort } from './agenda-creation-date';

type AgendaDateExclusionDialogProps = {
  periodDates: string[];
  excludedDates: string[];
  onExcludedDateChange: (date: string, excluded: boolean) => void;
  evaluatedWorkDates?: string[];
  workDatesLoading?: boolean;
  workDatesError?: string;
  onRetryWorkDates?: () => void;
  error?: string;
  disabled?: boolean;
};

function exclusionCountLabel(count: number) {
  return `${count} ${count === 1 ? 'excluida' : 'excluidas'}`;
}

export function AgendaDateExclusionDialog({
  periodDates,
  excludedDates,
  onExcludedDateChange,
  evaluatedWorkDates,
  workDatesLoading = false,
  workDatesError,
  onRetryWorkDates,
  error,
  disabled = false,
}: AgendaDateExclusionDialogProps) {
  const countLabel = exclusionCountLabel(excludedDates.length);

  return (
    <div className="space-y-2">
      <Dialog>
        <div className="inline-flex items-center gap-2">
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled}
              title="Excluir fechas del rango"
              aria-label={`Configurar exclusiones generales: ${countLabel}`}
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
              Excluir fechas del rango
            </DialogTitle>
            <DialogDescription className="text-left leading-5 text-slate-600">
              Las exclusiones manuales se aplican a todos los médicos. Los días sin
              horario se marcan automáticamente y no cuentan como excluidos.
            </DialogDescription>
          </DialogHeader>

          <fieldset disabled={disabled} className="min-h-0 px-5 py-4 sm:px-6">
            <legend className="sr-only">Fechas que se excluirán para todos los médicos</legend>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-800">Selecciona las fechas a excluir</p>
              <span
                aria-live="polite"
                className="rounded-full bg-sky-50 px-2.5 py-1 text-xs tabular-nums text-sky-800"
              >
                {countLabel}
              </span>
            </div>

            {workDatesLoading ? (
              <p className="mb-3 flex items-center gap-2 text-xs text-slate-600" role="status">
                <LoaderCircle
                  className="h-4 w-4 animate-spin text-sky-700 motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Revisando los horarios de los médicos seleccionados…
              </p>
            ) : null}

            {workDatesError ? (
              <div
                role="alert"
                className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
              >
                <span>No se pudieron identificar automáticamente los días no laborables.</span>
                {onRetryWorkDates ? (
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

            <div className="grid max-h-[min(56dvh,28rem)] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {periodDates.map((date) => {
                const excluded = excludedDates.includes(date);
                const noWork = evaluatedWorkDates
                  ? !evaluatedWorkDates.includes(date)
                  : false;

                return (
                  <label
                    key={date}
                    aria-disabled={noWork}
                    className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                      noWork
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                        : excluded
                        ? 'border-sky-300 bg-sky-50 text-sky-950'
                        : 'cursor-pointer border-slate-200 bg-white text-slate-800 hover:border-sky-300'
                    }`}
                  >
                    <Checkbox
                      checked={excluded || noWork}
                      disabled={noWork}
                      onCheckedChange={(value) => onExcludedDateChange(date, value === true)}
                      aria-label={
                        noWork
                          ? `${formatAgendaDate(date)}, no laborable según los horarios seleccionados`
                          : `${excluded ? 'Incluir nuevamente' : 'Excluir'} ${formatAgendaDate(date)}`
                      }
                      className="h-5 w-5"
                    />
                    <span className="min-w-0 flex-1 capitalize">
                      {formatAgendaDateShort(date)}
                    </span>
                    {noWork ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                        <CalendarOff className="h-3.5 w-3.5" aria-hidden="true" />
                        No laborable
                      </span>
                    ) : null}
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
