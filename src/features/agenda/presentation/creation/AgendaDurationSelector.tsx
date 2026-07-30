'use client';

import { Clock3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AGENDA_QUICK_DURATIONS } from './agenda-duration';

type AgendaDurationSelectorProps = {
  value: number;
  onChange: (value: number) => void;
  minimum: number;
  maximum: number;
  step: number;
  error?: string;
  disabled?: boolean;
};

export function AgendaDurationSelector({
  value,
  onChange,
  minimum,
  maximum,
  step,
  error,
  disabled = false,
}: AgendaDurationSelectorProps) {
  const durationLabel = Number.isFinite(value) ? `${value} min` : 'Sin definir';

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
              title="Duración de cada consulta"
              aria-label={`Configurar duración de cada consulta: ${durationLabel}`}
              aria-describedby={error ? 'agenda-duration-trigger-error' : undefined}
              className="h-11 w-11 rounded-full border-slate-200 bg-white text-sky-700 shadow-none hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
            >
              <Clock3 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <span
            aria-live="polite"
            className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs tabular-nums text-slate-600"
          >
            {durationLabel}
          </span>
        </div>

        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border-slate-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-5 py-5 pr-14 sm:px-6">
            <DialogTitle className="flex items-center gap-2 text-left text-lg text-slate-950">
              <Clock3 className="h-5 w-5 text-sky-700" aria-hidden="true" />
              Duración de cada consulta
            </DialogTitle>
            <DialogDescription className="text-left leading-5 text-slate-600">
              Selecciona una duración rápida o ingresa un valor personalizado.
            </DialogDescription>
          </DialogHeader>

          <fieldset disabled={disabled} className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <legend className="sr-only">Configurar duración de cada consulta</legend>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-800">Duraciones rápidas</p>
              <div className="flex flex-wrap gap-2">
                {AGENDA_QUICK_DURATIONS.map((minutes) => (
                  <Button
                    key={minutes}
                    type="button"
                    variant={value === minutes ? 'default' : 'outline'}
                    aria-pressed={value === minutes}
                    className="min-h-11 min-w-16"
                    onClick={() => onChange(minutes)}
                  >
                    {minutes} min
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda-custom-duration">Duración personalizada</Label>
              <Input
                id="agenda-custom-duration"
                type="number"
                inputMode="numeric"
                min={minimum}
                max={maximum}
                step={step}
                value={Number.isFinite(value) ? value : ''}
                onChange={(event) => onChange(Number(event.target.value))}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error ? 'agenda-duration-modal-error' : 'agenda-duration-help'
                }
                className="min-h-11 text-base sm:text-sm"
              />
              <p id="agenda-duration-help" className="text-xs leading-5 text-slate-500">
                Múltiplos de {step}, entre {minimum} y {maximum} minutos.
              </p>
              {error ? (
                <p
                  id="agenda-duration-modal-error"
                  role="alert"
                  className="text-sm font-medium text-rose-700"
                >
                  {error}
                </p>
              ) : null}
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
          id="agenda-duration-trigger-error"
          role="alert"
          className="text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
