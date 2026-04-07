'use client';

import { Lock, Printer } from 'lucide-react';
import { useState, useTransition } from 'react';
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
import { ReabrirRecomendacionDialog } from '@/components/recomendaciones/ReabrirRecomendacionDialog';
import { RecomendacionStatusBadge } from '@/components/recomendaciones/detail/RecomendacionStatusBadge';
import {
  type RecomendacionEstado,
  type RecomendacionMotivoReaperturaOption,
} from '@/components/recomendaciones/detail/types';

export function RecomendacionDetalleRightPanel({
  recomendacionId,
  estado,
  canClose,
  canReopen,
  canPrint,
  motivosReapertura,
  ultimaReapertura,
}: {
  recomendacionId: number;
  estado: RecomendacionEstado;
  canClose: boolean;
  canReopen: boolean;
  canPrint: boolean;
  motivosReapertura: RecomendacionMotivoReaperturaOption[];
  ultimaReapertura?: {
    fecha: string;
    actorNombre: string;
    motivoReapertura: string | null;
  } | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [closeOpen, setCloseOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isBusy = isClosing || isPending;
  const hasMotivosReapertura = motivosReapertura.length > 0;

  const closeButtonLabel = canClose
    ? 'Cerrar formulario'
    : estado === 'CERRADA'
      ? 'Formulario cerrado'
      : estado === 'ANULADA'
        ? 'Formulario anulado'
        : 'Cierre no disponible';

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
      setCloseOpen(false);
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
        {canPrint ? (
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
        ) : null}

        {canReopen && hasMotivosReapertura ? (
          <ReabrirRecomendacionDialog
            recomendacionId={recomendacionId}
            motivosReapertura={motivosReapertura}
            disabled={isBusy}
            triggerLabel="Reabrir formulario"
            triggerTitle="Reabrir recomendacion"
            triggerClassName="w-full justify-start bg-sky-600 text-white hover:bg-sky-700 hover:text-white disabled:bg-sky-200 disabled:text-white/80"
            triggerVariant="default"
          />
        ) : null}

        {canReopen && !hasMotivosReapertura ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs font-medium text-slate-700">
              No hay motivos activos de reapertura.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Configuralos desde administrador para habilitar esta accion.
            </p>
          </div>
        ) : null}

        <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              className="w-full justify-start text-white hover:text-white disabled:text-white/80"
              disabled={!canClose || isBusy}
            >
              <Lock className="h-4 w-4" />
              {closeButtonLabel}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="sm:max-w-md border-slate-200 bg-white shadow-2xl">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-xl text-slate-900">
                Cerrar formulario
              </AlertDialogTitle>
              <AlertDialogDescription className="leading-6 text-slate-600">
                Al cerrar la recomendacion, el formulario quedara bloqueado y no se podra seguir editando.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                disabled={isBusy}
                className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  void handleClose();
                }}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isBusy}
              >
                {isClosing ? 'Cerrando...' : 'Si, cerrar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {ultimaReapertura ? (
        <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50/70 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
            Ultima reapertura
          </p>
          <p className="mt-1 text-xs font-medium text-slate-700">
            {ultimaReapertura.fecha}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            Por: {ultimaReapertura.actorNombre}
          </p>
          {ultimaReapertura.motivoReapertura ? (
            <p className="mt-1 text-[11px] leading-5 text-slate-600">
              Motivo: {ultimaReapertura.motivoReapertura}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-[11px] leading-5 text-slate-500">
        {canClose
          ? 'Solo los formularios en borrador o reabiertos pueden cerrarse.'
          : canReopen && !hasMotivosReapertura
            ? 'La reapertura estara disponible cuando existan motivos activos.'
            : 'Las recomendaciones cerradas solo pueden reabrirse con un motivo registrado.'}
      </p>
    </div>
  );
}
