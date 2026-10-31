'use client';

import { Ban, LoaderCircle } from 'lucide-react';
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
import { SLOT_REASON_MAX, SLOT_REASON_MIN } from '@/features/agenda/domain/validation';

type CancelSlotsDialogProps = {
  count: number;
  errorMessage?: string;
  isPending: boolean;
  onConfirm: (motivo: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function slotLabel(count: number) {
  return count === 1 ? 'cupo' : 'cupos';
}

export default function CancelSlotsDialog({
  count,
  errorMessage,
  isPending,
  onConfirm,
  onOpenChange,
  open,
}: CancelSlotsDialogProps) {
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const tooShort = trimmed.length < SLOT_REASON_MIN;
  const label = slotLabel(count);

  function handleOpenChange(next: boolean) {
    if (!next) setReason('');
    onOpenChange(next);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="w-[calc(100%_-_2rem)] max-w-lg gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.24)] motion-reduce:duration-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!tooShort && !isPending && count > 0) onConfirm(trimmed);
          }}
        >
          <AlertDialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-slate-100 px-5 py-4 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
              <Ban className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <AlertDialogTitle className="text-base font-semibold text-slate-950">
                ¿Cancelar {count} {label}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600">
                Dejarán de estar libres para nuevas citas. Podrás revertirlo después.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="space-y-1 px-5 py-4">
            <Label htmlFor="cancel-slots-reason" className="text-sm font-medium text-slate-800">
              Motivo de la cancelación <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id="cancel-slots-reason"
              value={reason}
              maxLength={SLOT_REASON_MAX}
              rows={2}
              autoFocus
              disabled={isPending}
              aria-describedby="cancel-slots-reason-hint"
              placeholder="Ej.: el médico estará en capacitación ese día."
              onChange={(event) => setReason(event.target.value)}
              className="resize-none rounded-xl border-slate-300 text-sm"
            />
            <p id="cancel-slots-reason-hint" className="flex justify-between text-xs text-slate-500">
              <span>
                {tooShort
                  ? `Mínimo ${SLOT_REASON_MIN} caracteres.`
                  : `Quedará en el historial ${count === 1 ? 'del cupo' : 'de cada cupo'}.`}
              </span>
              <span className="tabular-nums">{reason.length}/{SLOT_REASON_MAX}</span>
            </p>

            {errorMessage ? (
              <div role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
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
              variant="destructive"
              className="min-h-10 rounded-xl bg-rose-700 px-5 text-white shadow-sm hover:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              disabled={isPending || tooShort || count === 0}
            >
              {isPending ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <Ban aria-hidden="true" />
              )}
              {isPending ? 'Cancelando…' : `Cancelar ${count} ${label}`}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
