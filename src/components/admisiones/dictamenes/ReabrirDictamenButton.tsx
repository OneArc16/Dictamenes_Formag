'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAdmisionesAccess } from '@/components/admisiones/AdmisionesAccessProvider';
import { Button } from '@/components/ui/button';
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

type Props = {
  dictamenId: number;
  estado?: string | boolean | null;
  onReopened?: () => void;
};

function isDictamenOpen(estado?: string | boolean | null) {
  if (typeof estado === 'boolean') {
    return estado;
  }

  const normalized = String(estado ?? '').trim().toUpperCase();
  return normalized === 'PENDIENTE' || normalized === 'REABIERTO' || normalized === 'ABIERTO';
}

export default function ReabrirDictamenButton({
  dictamenId,
  estado,
  onReopened,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canReabrirDictamen } = useAdmisionesAccess();

  const [open, setOpen] = useState(false);
  const isAlreadyOpen = isDictamenOpen(estado);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admisiones/dictamenes/${dictamenId}/reabrir`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo reabrir el dictamen.');
      }

      return data;
    },
    onSuccess: async () => {
      toast.success('Dictamen reabierto correctamente.');
      setOpen(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dictamenes-admisiones'] }),
        queryClient.invalidateQueries({ queryKey: ['dictamenes'] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId] }),
      ]);

      onReopened?.();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'No se pudo reabrir el dictamen.');
    },
  });

  const isBusy = mutation.isPending;

  if (!canReabrirDictamen || isAlreadyOpen) {
    return null;
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isBusy) return;
        setOpen(nextOpen);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
          title="Reabrir dictamen"
          aria-label="Reabrir dictamen"
          disabled={isBusy}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-lg border-slate-200 bg-white shadow-2xl">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-xl text-slate-900">
            Reabrir dictamen
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-6 text-slate-600">
            El dictamen volvera a estado reabierto y quedara disponible nuevamente para su gestion.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
          Esta accion reactiva el dictamen para que el equipo autorizado pueda retomarlo desde el flujo de trabajo.
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isBusy}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isBusy}
            className="text-white hover:text-white disabled:text-white/80"
            onClick={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
          >
            {isBusy ? 'Reabriendo...' : 'Confirmar reapertura'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
