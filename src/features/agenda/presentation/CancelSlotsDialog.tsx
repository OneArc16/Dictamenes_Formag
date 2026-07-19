'use client';

import { Ban, LoaderCircle, ShieldCheck } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type CancelSlotsDialogProps = {
  count: number;
  errorMessage?: string;
  isPending: boolean;
  onConfirm: () => void;
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
  const label = slotLabel(count);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100%_-_2rem)] max-w-md gap-0 overflow-hidden rounded-3xl border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.24)] motion-reduce:duration-0">
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
            <Ban className="h-6 w-6" aria-hidden="true" />
          </div>

          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
              ¿Cancelar {count} {label}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-slate-600">
              Los cupos seleccionados dejarán de estar disponibles para nuevas
              citas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-5 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-slate-600"
              aria-hidden="true"
            />
            <p className="text-sm leading-5 text-slate-700">
              Se conservará la trazabilidad de la cancelación y los demás cupos
              no serán modificados.
            </p>
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800"
            >
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 border-t border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2 sm:px-7 sm:py-5">
          <AlertDialogCancel
            disabled={isPending}
            className="mt-0 min-h-11 rounded-xl border-slate-300 bg-white text-slate-700 shadow-none hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Volver
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 rounded-xl bg-rose-700 text-white shadow-sm hover:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            disabled={isPending || count === 0}
            onClick={onConfirm}
          >
            {isPending ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Ban aria-hidden="true" />
            )}
            {isPending ? 'Cancelando…' : `Sí, cancelar ${count}`}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
