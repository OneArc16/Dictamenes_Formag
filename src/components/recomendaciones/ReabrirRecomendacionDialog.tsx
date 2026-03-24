'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, type LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type RecomendacionMotivoReaperturaOption } from '@/components/recomendaciones/detail/types';

type TriggerVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
type TriggerSize = 'default' | 'sm' | 'lg' | 'icon';

type ReabrirRecomendacionDialogProps = {
  recomendacionId: number;
  motivosReapertura: RecomendacionMotivoReaperturaOption[];
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
  const [open, setOpen] = useState(false);
  const [selectedMotivoId, setSelectedMotivoId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  const isBusy = isSubmitting || isRefreshing;
  const isTriggerDisabled = disabled || motivosReapertura.length === 0 || isBusy;

  useEffect(() => {
    if (!open) {
      setSelectedMotivoId('');
      return;
    }

    if (!selectedMotivoId && motivosReapertura.length > 0) {
      setSelectedMotivoId(String(motivosReapertura[0].id));
    }
  }, [motivosReapertura, open, selectedMotivoId]);

  const selectedMotivo = useMemo(
    () => motivosReapertura.find((item) => String(item.id) === selectedMotivoId) ?? null,
    [motivosReapertura, selectedMotivoId],
  );

  const handleReopen = async () => {
    if (!selectedMotivoId) {
      toast.error('Selecciona un motivo de reapertura.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/recomendaciones/${recomendacionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'reabrir',
          motivoReaperturaId: Number(selectedMotivoId),
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo reabrir la recomendacion.');
      }

      toast.success('Recomendacion reabierta correctamente.');
      setOpen(false);
      setSelectedMotivoId('');

      if (onReopened) {
        onReopened();
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error reabriendo recomendacion:', error);
      toast.error(
        error instanceof Error ? error.message : 'No se pudo reabrir la recomendacion.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
          disabled={isTriggerDisabled}
          title={
            triggerTitle ??
            (motivosReapertura.length === 0
              ? 'No hay motivos activos de reapertura'
              : triggerLabel)
          }
        >
          <Icon className="h-4 w-4" />
          {iconOnly ? <span className="sr-only">{triggerLabel}</span> : triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg border-slate-200 bg-white shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl text-slate-900">
            Reabrir recomendacion
          </DialogTitle>
          <DialogDescription className="leading-6 text-slate-600">
            Selecciona el motivo que justifica la reapertura. La recomendacion volvera a estado reabierto y se registrara en el historial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Motivo de reapertura
            </Label>
            <Select value={selectedMotivoId} onValueChange={setSelectedMotivoId}>
              <SelectTrigger className="h-10 rounded-md border-slate-300 bg-white text-sm shadow-sm focus:ring-1 focus:ring-blue-500/60">
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivosReapertura.map((motivoItem) => (
                  <SelectItem key={motivoItem.id} value={String(motivoItem.id)}>
                    {motivoItem.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMotivo?.descripcion ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Descripcion
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {selectedMotivo.descripcion}
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isBusy}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => {
              void handleReopen();
            }}
            disabled={isBusy || !selectedMotivoId}
            className="text-white hover:text-white disabled:text-white/80"
          >
            {isSubmitting ? 'Reabriendo...' : 'Confirmar reapertura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
