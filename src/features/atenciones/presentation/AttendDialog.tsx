'use client';

import { LoaderCircle, Stethoscope } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { formatAtencionFecha, formatAtencionHora, type AtencionRow } from './AtencionesTable';

type AttendDialogProps = {
  row: Pick<AtencionRow, 'docenteNombre' | 'docenteDocumento' | 'inicioProgramado' | 'especialidadNombre'> | null;
  title?: string;
  confirmLabel?: string;
  errorMessage?: string;
  isPending: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

export default function AttendDialog({
  row,
  title = '¿Atender al paciente?',
  confirmLabel = 'Marcar como atendido',
  errorMessage,
  isPending,
  onConfirm,
  onOpenChange,
}: AttendDialogProps) {
  return (
    <AlertDialog open={row !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100%_-_2rem)] max-w-md gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.24)] motion-reduce:duration-0">
        <AlertDialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-slate-100 px-5 py-4 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <AlertDialogTitle className="text-base font-semibold text-slate-950">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600">
              La cita quedará marcada como atendida.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {row ? (
          <div className="space-y-3 px-5 py-4">
            <dl className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <dt className="sr-only">Paciente</dt>
              <dd className="font-semibold text-slate-900">{row.docenteNombre}</dd>
              <dd className="text-slate-600">Documento {row.docenteDocumento}</dd>
              <dt className="sr-only">Cita</dt>
              <dd className="mt-1 text-xs text-slate-500">
                {formatAtencionFecha(row.inicioProgramado)} · {formatAtencionHora(row.inicioProgramado)} · {row.especialidadNombre}
              </dd>
            </dl>

            {errorMessage ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {errorMessage}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            type="button"
            disabled={isPending}
            className="mt-0 min-h-10 rounded-xl border-slate-300 bg-white px-5 text-slate-700 shadow-none hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Volver
          </AlertDialogCancel>
          <Button
            type="button"
            className="min-h-10 rounded-xl bg-emerald-700 px-5 text-white shadow-sm hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Stethoscope aria-hidden="true" />
            )}
            {isPending ? 'Guardando…' : confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
