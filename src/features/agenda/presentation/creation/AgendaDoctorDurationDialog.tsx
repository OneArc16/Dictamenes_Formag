'use client';

import { Check, RotateCcw, Timer } from 'lucide-react';
import { useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { consultationDurationSchema } from '@/features/agenda/domain/validation';
import { AGENDA_QUICK_DURATIONS } from './agenda-duration';

type AgendaDoctorDurationDialogProps = {
  doctorId: number;
  doctorName: string;
  defaultDuration: number;
  duration?: number;
  minimum: number;
  maximum: number;
  step: number;
  onChange: (duration?: number) => void;
  disabled?: boolean;
};

function validateDuration(
  value: string,
  minimum: number,
  maximum: number,
  step: number,
) {
  const duration = Number(value);
  const parsed = consultationDurationSchema.safeParse(duration);
  if (!parsed.success) return parsed.error.issues[0]?.message ?? 'La duración no es válida.';
  if (duration < minimum || duration > maximum) {
    return `Ingresa una duración entre ${minimum} y ${maximum} minutos.`;
  }
  if (duration % step !== 0) {
    return `La duración debe ser múltiplo de ${step} minutos.`;
  }
  return '';
}

export function AgendaDoctorDurationDialog({
  doctorId,
  doctorName,
  defaultDuration,
  duration,
  minimum,
  maximum,
  step,
  onChange,
  disabled = false,
}: AgendaDoctorDurationDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(duration ?? defaultDuration));
  const [error, setError] = useState('');
  const tooltipId = `agenda-doctor-duration-tooltip-${doctorId}`;
  const inputId = `agenda-doctor-duration-${doctorId}`;
  const effectiveDuration = duration ?? defaultDuration;
  const customized = duration !== undefined;

  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(String(duration ?? defaultDuration));
      setError('');
    }
  };

  const selectDuration = (minutes: number) => {
    setDraft(String(minutes));
    setError('');
  };

  const apply = () => {
    const nextError = validateDuration(draft, minimum, maximum, step);
    if (nextError) {
      setError(nextError);
      return;
    }
    const value = Number(draft);
    onChange(value === defaultDuration ? undefined : value);
    setOpen(false);
  };

  const restoreDefault = () => {
    onChange(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <IconTooltip
        id={tooltipId}
        label={`Duración: ${effectiveDuration} min${customized ? ' (personalizada)' : ''}`}
        align="right"
      >
        <DialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled}
            aria-label={`Configurar minutos por consulta de ${doctorName}: ${effectiveDuration} minutos`}
            aria-describedby={tooltipId}
            className={`relative h-11 w-11 rounded-full shadow-none transition-colors duration-200 ${
              customized
                ? 'border-sky-300 bg-sky-50 text-sky-800 hover:border-sky-400 hover:bg-sky-100'
                : 'border-slate-200 text-sky-700 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-800'
            }`}
          >
            <Timer className="h-4 w-4" aria-hidden="true" />
            {customized ? (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-sky-700 text-white"
              >
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
            ) : null}
          </Button>
        </DialogTrigger>
      </IconTooltip>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border-slate-200 bg-white p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 px-5 py-5 pr-14 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-left text-lg text-slate-950">
            <Timer className="h-5 w-5 text-sky-700" aria-hidden="true" />
            Minutos por consulta
          </DialogTitle>
          <DialogDescription className="text-left leading-5 text-slate-600">
            Define la duración de las consultas de {doctorName} únicamente para esta agenda.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm leading-5 text-sky-900">
            Duración general: <strong>{defaultDuration} minutos</strong>. Los demás médicos
            conservarán este valor.
          </div>

          <fieldset disabled={disabled}>
            <legend className="mb-2 text-sm font-medium text-slate-800">
              Duraciones rápidas
            </legend>
            <div className="flex flex-wrap gap-2">
              {AGENDA_QUICK_DURATIONS.filter(
                (minutes) =>
                  minutes >= minimum &&
                  minutes <= maximum &&
                  minutes % step === 0,
              ).map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant={Number(draft) === minutes ? 'default' : 'outline'}
                  aria-pressed={Number(draft) === minutes}
                  className="min-h-11 min-w-16"
                  onClick={() => selectDuration(minutes)}
                >
                  {minutes} min
                </Button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor={inputId}>Duración personalizada</Label>
            <Input
              id={inputId}
              type="number"
              inputMode="numeric"
              min={minimum}
              max={maximum}
              step={step}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setError('');
              }}
              onBlur={() => setError(validateDuration(draft, minimum, maximum, step))}
              aria-invalid={Boolean(error)}
              aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ''}`}
              className="min-h-11 text-base sm:text-sm"
            />
            <p id={`${inputId}-help`} className="text-xs leading-5 text-slate-500">
              Múltiplos de {step}, entre {minimum} y {maximum} minutos.
            </p>
            {error ? (
              <p
                id={`${inputId}-error`}
                role="alert"
                className="text-sm font-medium text-rose-700"
              >
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            disabled={!customized}
            className="min-h-11 sm:mr-auto"
            onClick={restoreDefault}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Usar duración general
          </Button>
          <Button
            type="button"
            className="min-h-11 bg-sky-700 px-5 text-white hover:bg-sky-800"
            onClick={apply}
          >
            Aplicar a este médico
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
