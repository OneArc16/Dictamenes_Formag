'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';

type Props = {
  dictamenId: number;
  /** opcional: si ya sabes el estado, para deshabilitar en UI */
  disabled?: boolean;
  /** callback opcional por si quieres refrescar manualmente */
  onSuccess?: () => void;
};

async function reabrirDictamen(id: number) {
  const res = await fetch(`/api/dictamenes/${id}/reabrir`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'No se pudo reabrir el dictamen');
  }
  return data as { ok: true; dictamen: { id: number; estado: 'REABIERTO' } };
}

export default function ReabrirDictamenButton({ dictamenId, disabled, onSuccess }: Props) {
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: () => reabrirDictamen(dictamenId),
    onMutate: () => {
      toast.dismiss();
      toast.loading('Reabriendo dictamen…', { id: 'reabrir-dictamen' });
    },
    onSuccess: async () => {
      toast.success('Dictamen reabierto correctamente', { id: 'reabrir-dictamen' });

      // Refresca el detalle
      await qc.invalidateQueries({ queryKey: ['dictamen', dictamenId] });

      // Refresca listados (usa el prefijo que tengas; si no existe, no pasa nada)
      await qc.invalidateQueries({ queryKey: ['dictamenes'] });
      await qc.invalidateQueries({ queryKey: ['dictamenes-admisiones'] });

      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Error reabriendo dictamen', { id: 'reabrir-dictamen' });
    },
  });

  const handleClick = () => {
    if (disabled || m.isPending) return;

    const ok = window.confirm('¿Seguro que deseas REABRIR este dictamen?');
    if (!ok) return;

    m.mutate();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || m.isPending}
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm border transition-colors',
        disabled || m.isPending
          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300',
      ].join(' ')}
      title="Reabrir dictamen"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {m.isPending ? 'Reabriendo…' : 'Reabrir'}
    </button>
  );
}
