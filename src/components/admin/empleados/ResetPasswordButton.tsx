'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function ResetPasswordButton({ id }: { id: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  const close = () => {
    setOpen(false);
    setP1('');
    setP2('');
  };

  const mutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const res = await fetch(`/api/admin/empleados/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo resetear');
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada');
      close();
      router.refresh(); // ✅ refresca server components
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo resetear');
    },
  });

  const submit = () => {
    const pass = p1.trim();
    if (!pass || pass.length < 6) {
      toast.error('Debe tener mínimo 6 caracteres');
      return;
    }
    if (pass !== p2.trim()) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    mutation.mutate(pass);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        Reset contraseña
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={mutation.isPending ? undefined : close}
          />

          <div className="relative w-full max-w-sm p-4 bg-white border shadow-xl rounded-2xl border-slate-200">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Resetear contraseña</h3>
              <p className="text-[11px] text-slate-500">
                Escribe la nueva contraseña y confírmala.
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={p1}
                  onChange={(e) => setP1(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
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
                onClick={submit}
                disabled={mutation.isPending}
                className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {mutation.isPending ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
