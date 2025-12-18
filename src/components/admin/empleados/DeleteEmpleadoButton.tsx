'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

export default function DeleteEmpleadoButton({ id }: { id: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const close = () => {
    setOpen(false);
    setConfirmText('');
  };

  const canConfirm = confirmText.trim().toUpperCase() === 'ELIMINAR';

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/empleados/${id}/delete`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo eliminar');
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Empleado eliminado');
      close();
      router.replace('/admin/empleados');
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo eliminar');
    },
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
      >
        Eliminar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={mutation.isPending ? undefined : close}
          />

          <div className="relative w-full max-w-sm p-4 bg-white border shadow-xl rounded-2xl border-slate-200">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Eliminar empleado</h3>
              <p className="text-[11px] text-slate-500">
                Esto es definitivo. Si tiene dictámenes asociados, el sistema no permitirá eliminarlo (deberás inactivarlo).
              </p>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-medium text-slate-600">
                Escribe <span className="font-semibold text-rose-700">ELIMINAR</span> para confirmar
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-rose-500/30"
                placeholder="ELIMINAR"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={close}
                disabled={mutation.isPending}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => mutation.mutate()}
                disabled={!canConfirm || mutation.isPending}
                className="rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
              >
                {mutation.isPending ? 'Eliminando…' : 'Eliminar definitivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
