'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

type Props = {
  method: 'POST' | 'PATCH';
  apiUrl: string;
  submitLabel?: string;
  successMessage?: string;
  onSuccessRedirectTo?: string;
  initialNombre?: string;
};

export default function PerfilForm({
  method,
  apiUrl,
  submitLabel = 'Guardar',
  successMessage = 'Guardado correctamente',
  onSuccessRedirectTo,
  initialNombre = '',
}: Props) {
  const router = useRouter();

  const initial = useMemo(() => initialNombre ?? '', [initialNombre]);
  const [nombre, setNombre] = useState(initial);

  useEffect(() => setNombre(initial), [initial]);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? 'No se pudo guardar');
      return data;
    },
    onSuccess: () => {
      toast.success(successMessage);
      if (onSuccessRedirectTo) router.replace(onSuccessRedirectTo);
      router.refresh();
    },
    onError: (err: any) => toast.error(err?.message ?? 'No se pudo guardar'),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutation.isPending) return;

    const n = (nombre ?? '').trim().toUpperCase();
    if (!n) return toast.error('El nombre es obligatorio');

    mutation.mutate({ nombre: n });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-slate-600">Nombre *</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          placeholder="Ej: ADMISIONISTA"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {mutation.isPending ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
