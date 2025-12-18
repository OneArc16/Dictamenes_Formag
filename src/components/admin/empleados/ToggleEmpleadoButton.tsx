'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

type Props = {
  id: number;
  activo: boolean;
  /** Si tu ruta es distinta, pásala desde la tabla */
  apiUrl?: string;
};

export default function ToggleEmpleadoButton({ id, activo, apiUrl }: Props) {
  const router = useRouter();

  const url = apiUrl ?? `/api/admin/empleados/${id}/toggle`;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo cambiar el estado');
      }

      return data;
    },
    onSuccess: () => {
      toast.success(activo ? 'Empleado inactivado' : 'Empleado activado');
      // ✅ refresca server components (tu tabla viene del server con Prisma)
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo cambiar el estado');
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={[
        'rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm border',
        'disabled:opacity-60',
        activo
          ? 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50'
          : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50',
      ].join(' ')}
      title={activo ? 'Inactivar empleado' : 'Activar empleado'}
    >
      {mutation.isPending ? 'Guardando…' : activo ? 'Inactivar' : 'Activar'}
    </button>
  );
}
