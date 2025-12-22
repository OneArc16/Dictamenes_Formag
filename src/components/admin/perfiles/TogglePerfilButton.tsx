'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

type Props = {
  id: number;
  estado: number; // 1 | 0
};

export default function TogglePerfilButton({ id, estado }: Props) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/perfiles/${id}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? 'No se pudo actualizar');
      return data;
    },
    onSuccess: () => {
      toast.success(estado === 1 ? 'Perfil inactivado' : 'Perfil activado');
      router.refresh();
    },
    onError: (err: any) => toast.error(err?.message ?? 'Error'),
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={[
        'rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm border',
        estado === 1
          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        mutation.isPending ? 'opacity-60' : '',
      ].join(' ')}
    >
      {mutation.isPending ? '...' : estado === 1 ? 'Inactivar' : 'Activar'}
    </button>
  );
}
