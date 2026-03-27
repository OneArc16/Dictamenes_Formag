'use client';

import { useEffect, useMemo, useState } from 'react';
import { type LucideIcon, RotateCcw } from 'lucide-react';
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
import { type MotivoReaperturaOption } from '@/lib/reapertura/types';

type TriggerVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
type TriggerSize = 'default' | 'sm' | 'lg' | 'icon';

type Props = {
  motivosReapertura: MotivoReaperturaOption[];
  disabled?: boolean;
  triggerLabel?: string;
  triggerTitle?: string;
  triggerClassName?: string;
  triggerVariant?: TriggerVariant;
  triggerSize?: TriggerSize;
  icon?: LucideIcon;
  iconOnly?: boolean;
  dialogTitle: string;
  dialogDescription: string;
  confirmLabel?: string;
  submittingLabel?: string;
  emptyMotivosTitle?: string;
  onConfirm: (motivoReaperturaId: number) => Promise<void>;
};

export function ReabrirConMotivoDialog({
  motivosReapertura,
  disabled = false,
  triggerLabel = 'Reabrir',
  triggerTitle,
  triggerClassName,
  triggerVariant = 'outline',
  triggerSize = 'default',
  icon: Icon = RotateCcw,
  iconOnly = false,
  dialogTitle,
  dialogDescription,
  confirmLabel = 'Confirmar reapertura',
  submittingLabel = 'Reabriendo...',
  emptyMotivosTitle = 'No hay motivos activos de reapertura',
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedMotivoId, setSelectedMotivoId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const isBusy = disabled || isSubmitting;
  const triggerDisabled = isBusy || motivosReapertura.length === 0;

  const handleConfirm = async () => {
    if (!selectedMotivoId) {
      toast.error('Selecciona un motivo de reapertura.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(Number(selectedMotivoId));
      setOpen(false);
      setSelectedMotivoId('');
    } catch (error) {
      console.error('Error confirmando reapertura:', error);
      toast.error(error instanceof Error ? error.message : 'No se pudo completar la reapertura.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!isSubmitting ? setOpen(nextOpen) : undefined)}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
          disabled={triggerDisabled}
          title={triggerTitle ?? (motivosReapertura.length === 0 ? emptyMotivosTitle : triggerLabel)}
        >
          <Icon className="h-4 w-4" />
          {iconOnly ? <span className="sr-only">{triggerLabel}</span> : triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg border-slate-200 bg-white shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl text-slate-900">{dialogTitle}</DialogTitle>
          <DialogDescription className="leading-6 text-slate-600">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Motivo de reapertura</Label>
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
              <p className="mt-1 text-sm leading-6 text-slate-600">{selectedMotivo.descripcion}</p>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => {
              void handleConfirm();
            }}
            disabled={isBusy || !selectedMotivoId}
            className="text-white hover:text-white disabled:text-white/80"
          >
            {isSubmitting ? submittingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
