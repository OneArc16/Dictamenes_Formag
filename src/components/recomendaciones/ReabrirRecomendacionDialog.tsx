'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, type LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { ReabrirConMotivoDialog } from '@/components/reapertura/ReabrirConMotivoDialog';
import { type MotivoReaperturaOption } from '@/lib/reapertura/types';

type TriggerVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
type TriggerSize = 'default' | 'sm' | 'lg' | 'icon';

type ReabrirRecomendacionDialogProps = {
  recomendacionId: number;
  motivosReapertura: MotivoReaperturaOption[];
  disabled?: boolean;
  triggerLabel?: string;
  triggerTitle?: string;
  triggerClassName?: string;
  triggerVariant?: TriggerVariant;
  triggerSize?: TriggerSize;
  icon?: LucideIcon;
  iconOnly?: boolean;
  onReopened?: () => void;
};

export function ReabrirRecomendacionDialog({
  recomendacionId,
  motivosReapertura,
  disabled = false,
  triggerLabel = 'Reabrir recomendacion',
  triggerTitle,
  triggerClassName,
  triggerVariant = 'outline',
  triggerSize = 'default',
  icon: Icon = RotateCcw,
  iconOnly = false,
  onReopened,
}: ReabrirRecomendacionDialogProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  return (
    <ReabrirConMotivoDialog
      motivosReapertura={motivosReapertura}
      disabled={disabled || isRefreshing}
      triggerLabel={triggerLabel}
      triggerTitle={triggerTitle}
      triggerClassName={triggerClassName}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      icon={Icon}
      iconOnly={iconOnly}
      dialogTitle="Reabrir recomendacion"
      dialogDescription="Selecciona el motivo que justifica la reapertura. La recomendacion volvera a estado reabierto y se registrara en el historial."
      confirmLabel="Confirmar reapertura"
      submittingLabel="Reabriendo..."
      onConfirm={async (motivoReaperturaId) => {
        const response = await fetch(`/api/recomendaciones/${recomendacionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: 'reabrir',
            motivoReaperturaId,
          }),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          throw new Error(data?.error ?? 'No se pudo reabrir la recomendacion.');
        }

        toast.success('Recomendacion reabierta correctamente.');
        onReopened?.();
        startTransition(() => {
          router.refresh();
        });
      }}
    />
  );
}
