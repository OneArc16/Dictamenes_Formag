'use client';

import { ArrowLeft, Calculator, CheckCircle2, LoaderCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import type { AgendaCreationProcess } from './agenda-creation-types';

type AgendaCreationActionsProps = {
  process: AgendaCreationProcess;
  onCalculate: () => void;
  onConfirm: () => void;
};

export function AgendaCreationActions({
  process,
  onCalculate,
  onConfirm,
}: AgendaCreationActionsProps) {
  const busy = process.status === 'calculating' || process.status === 'confirming';
  const canConfirm =
    process.status === 'ready' &&
    !process.preview.bloqueado &&
    process.preview.totalNuevos > 0;

  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <Button asChild variant="outline" className="min-h-11">
        <Link href="/agenda">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a agendas
        </Link>
      </Button>

      {process.status === 'ready' ? (
        <Button
          type="button"
          className="min-h-11 bg-emerald-700 hover:bg-emerald-800"
          onClick={onConfirm}
          disabled={!canConfirm}
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {process.preview.bloqueado
            ? 'Corrige los problemas para confirmar'
            : process.preview.totalNuevos === 0
              ? 'Sin cupos nuevos para confirmar'
              : `Confirmar ${process.preview.totalNuevos} cupos`}
        </Button>
      ) : (
        <Button
          type="button"
          className="min-h-11 bg-sky-700 hover:bg-sky-800"
          onClick={onCalculate}
          disabled={busy}
        >
          {process.status === 'calculating' || process.status === 'confirming' ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : process.status === 'stale' ? (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Calculator className="h-4 w-4" aria-hidden="true" />
          )}
          {process.status === 'calculating'
            ? 'Calculando…'
            : process.status === 'confirming'
              ? 'Confirmando…'
              : process.status === 'stale'
                ? 'Recalcular agenda'
                : 'Calcular agenda'}
        </Button>
      )}
    </div>
  );
}
