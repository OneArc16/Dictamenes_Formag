'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type Props = {
  motivoId: number;
  estado: boolean;
};

export default function ToggleMotivoReaperturaEstadoButton({ motivoId, estado }: Props) {
  const router = useRouter();
  const nextEstado = !estado;

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/motivos-reapertura/${motivoId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nextEstado }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo actualizar el estado');
      }

      return data;
    },
    onSuccess: () => {
      toast.success(nextEstado ? 'Motivo activado' : 'Motivo inactivado');
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar');
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={[
        'rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm transition-colors disabled:opacity-60',
        nextEstado
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
      ].join(' ')}
    >
      {mutation.isPending ? 'Actualizando…' : nextEstado ? 'Activar' : 'Inactivar'}
    </button>
  );
}
