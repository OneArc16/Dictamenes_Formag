'use client';

import { LoaderCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatTime, todayInAgendaZone, type AgendaSlotRow } from './agenda-slots-view';
import { dateInTimeZone } from '@/features/agenda/domain/date-time';
import { SLOT_REASON_MAX as MAX_REASON, SLOT_REASON_MIN as MIN_REASON } from '@/features/agenda/domain/validation';

type RestoreSlotDialogProps = {
  slot: AgendaSlotRow | null;
  errorMessage?: string;
  isPending: boolean;
  onConfirm: (motivo: string) => void;
  onOpenChange: (open: boolean) => void;
};

function formatShortDay(date: string) {
  const label = new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatCancelledAt(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(value));
}

export default function RestoreSlotDialog({
  slot,
  errorMessage,
  isPending,
  onConfirm,
  onOpenChange,
}: RestoreSlotDialogProps) {
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const tooShort = trimmed.length < MIN_REASON;

  function handleOpenChange(open: boolean) {
    if (!open) setReason('');
    onOpenChange(open);
  }

  const day = slot ? dateInTimeZone(new Date(slot.inicio), 'America/Bogota') : '';

  return (
    <AlertDialog open={slot !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="w-[calc(100%_-_2rem)] max-w-2xl gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.24)] motion-reduce:duration-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!tooShort && !isPending) onConfirm(trimmed);
          }}
        >
          <AlertDialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-slate-100 px-5 py-4 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100">
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <AlertDialogTitle className="text-base font-semibold text-slate-950">
                ¿Revertir la cancelación?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600">
                El cupo volverá a quedar libre para asignar citas.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {slot ? (
              <dl className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div>
                  <dt className="sr-only">Cupo</dt>
                  <dd className="font-semibold text-slate-900">
                    {formatShortDay(day)}
                    {day === todayInAgendaZone() ? ' (hoy)' : ''} · {formatTime(slot.inicio)}–{formatTime(slot.fin)}
                  </dd>
                  <dd className="truncate text-slate-600" title={slot.medicoNombre}>{slot.medicoNombre}</dd>
                </div>
                {slot.cancelacion ? (
                  <div className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                    <dt className="font-medium text-slate-500">Se canceló</dt>
                    <dd>
                      {slot.cancelacion.en ? formatCancelledAt(slot.cancelacion.en) : 'Fecha no registrada'}
                      {slot.cancelacion.por ? ` · ${slot.cancelacion.por}` : ''}
                    </dd>
                    {slot.cancelacion.motivo ? <dd className="mt-0.5 line-clamp-2 italic">“{slot.cancelacion.motivo}”</dd> : null}
                  </div>
                ) : null}
              </dl>
            ) : null}

            <div className="flex flex-col gap-1">
              <Label htmlFor="restore-slot-reason" className="text-sm font-medium text-slate-800">
                Motivo de la reversión <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                id="restore-slot-reason"
                value={reason}
                maxLength={MAX_REASON}
                rows={3}
                autoFocus
                disabled={isPending}
                aria-describedby="restore-slot-reason-hint"
                placeholder="Ej.: se canceló por error, el médico sí atenderá ese día."
                onChange={(event) => setReason(event.target.value)}
                className="min-h-0 flex-1 resize-none rounded-xl border-slate-300 text-sm"
              />
              <p id="restore-slot-reason-hint" className="flex justify-between text-xs text-slate-500">
                <span>{tooShort ? `Mínimo ${MIN_REASON} caracteres.` : 'Quedará en el historial del cupo.'}</span>
                <span className="tabular-nums">{reason.length}/{MAX_REASON}</span>
              </p>
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:col-span-2"
              >
                {errorMessage}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel
              type="button"
              disabled={isPending}
              className="mt-0 min-h-10 rounded-xl border-slate-300 bg-white px-5 text-slate-700 shadow-none hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Volver
            </AlertDialogCancel>
            <Button
              type="submit"
              className="min-h-10 rounded-xl bg-emerald-700 px-5 text-white shadow-sm hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              disabled={isPending || tooShort}
            >
              {isPending ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <RotateCcw aria-hidden="true" />
              )}
              {isPending ? 'Revirtiendo…' : 'Revertir cancelación'}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
