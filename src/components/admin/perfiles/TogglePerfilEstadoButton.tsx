'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

type Props = {
  perfilId: number;
  estado: number; // 1 | 0
};

export default function TogglePerfilEstadoButton({ perfilId, estado }: Props) {
  const router = useRouter();

  const nextEstado = estado === 1 ? 0 : 1;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/perfiles/${perfilId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nextEstado }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? 'No se pudo actualizar');
      return data;
    },
    onSuccess: () => {
      toast.success(nextEstado === 1 ? 'Perfil activado' : 'Perfil inactivado');
      router.refresh(); // server component refresh
    },
    onError: (err: any) => toast.error(err?.message ?? 'Error actualizando'),
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={[
        'rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm border transition-colors disabled:opacity-60',
        nextEstado === 1
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      ].join(' ')}
    >
      {mutation.isPending ? 'Actualizando…' : nextEstado === 1 ? 'Activar' : 'Inactivar'}
    </button>
  );
}
