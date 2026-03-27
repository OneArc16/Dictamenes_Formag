'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAdmisionesAccess } from '@/components/admisiones/AdmisionesAccessProvider';
import { ReabrirConMotivoDialog } from '@/components/reapertura/ReabrirConMotivoDialog';
import { type MotivoReaperturaOption } from '@/lib/reapertura/types';

type Props = {
  dictamenId: number;
  estado?: string | boolean | null;
  motivosReapertura: MotivoReaperturaOption[];
  disabled?: boolean;
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
  motivosReapertura,
  disabled = false,
  onReopened,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canReabrirDictamen } = useAdmisionesAccess();

  const mutation = useMutation({
    mutationFn: async (motivoReaperturaId: number) => {
      const response = await fetch(`/api/admisiones/dictamenes/${dictamenId}/reabrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ motivoReaperturaId }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo reabrir el dictamen.');
      }

      return data;
    },
  });

  const isAlreadyOpen = isDictamenOpen(estado);

  if (!canReabrirDictamen || isAlreadyOpen) {
    return null;
  }

  return (
    <ReabrirConMotivoDialog
      motivosReapertura={motivosReapertura}
      disabled={disabled || mutation.isPending}
      triggerLabel="Reabrir dictamen"
      triggerTitle="Reabrir dictamen"
      triggerVariant="outline"
      triggerSize="icon"
      triggerClassName="h-8 w-8 rounded-full border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
      icon={RotateCcw}
      iconOnly
      dialogTitle="Reabrir dictamen"
      dialogDescription="Selecciona el motivo que justifica la reapertura. El dictamen volvera a estado reabierto y el evento quedara registrado en el historial."
      confirmLabel="Confirmar reapertura"
      submittingLabel="Reabriendo..."
      onConfirm={async (motivoReaperturaId) => {
        await mutation.mutateAsync(motivoReaperturaId);
        toast.success('Dictamen reabierto correctamente.');

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['dictamenes-admisiones'] }),
          queryClient.invalidateQueries({ queryKey: ['dictamenes'] }),
          queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId] }),
        ]);

        onReopened?.();
        router.refresh();
      }}
    />
  );
}
