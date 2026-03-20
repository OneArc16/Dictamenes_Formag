'use client';

import { useState, useTransition } from 'react';
import { Lock, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RecomendacionStatusBadge } from '@/components/recomendaciones/detail/RecomendacionStatusBadge';
import { type RecomendacionEstado } from '@/components/recomendaciones/detail/types';

export function RecomendacionDetalleRightPanel({
  recomendacionId,
  estado,
}: {
  recomendacionId: number;
  estado: RecomendacionEstado;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isClosed = estado !== 'BORRADOR';
  const isBusy = isClosing || isPending;

  const handlePrint = () => {
    window.open(
      `/api/recomendaciones/${recomendacionId}/pdf-react`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleClose = async () => {
    try {
      setIsClosing(true);

      const response = await fetch(`/api/recomendaciones/${recomendacionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'cerrar' }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo cerrar la recomendacion.');
      }

      toast.success('Formulario cerrado correctamente.');
      setOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error cerrando recomendacion:', error);
      toast.error(
        error instanceof Error ? error.message : 'No se pudo cerrar la recomendacion.',
      );
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Acciones
        </h2>
        <div>
          <RecomendacionStatusBadge estado={estado} />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={handlePrint}
          disabled={isBusy}
        >
          <Printer className="h-4 w-4" />
          Imprimir PDF
        </Button>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              className="w-full justify-start text-white hover:text-white disabled:text-white/80"
              disabled={isClosed || isBusy}
            >
              <Lock className="h-4 w-4" />
              {isClosed ? 'Formulario cerrado' : 'Cerrar formulario'}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="sm:max-w-md border-slate-200 bg-white shadow-2xl">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-xl text-slate-900">Cerrar formulario</AlertDialogTitle>
              <AlertDialogDescription className="leading-6 text-slate-600">
                Al cerrar la recomendacion, el formulario quedara bloqueado y no se podra seguir editando.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel disabled={isBusy} className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  void handleClose();
                }}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isBusy}
              >
                {isBusy ? 'Cerrando...' : 'Si, cerrar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="mt-4 text-[11px] leading-5 text-slate-500">
        Cuando el formulario este cerrado, los campos quedaran en solo lectura.
      </p>
    </div>
  );
}

