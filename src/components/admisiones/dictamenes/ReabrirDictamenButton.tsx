'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { RefreshCcw } from 'lucide-react';
import { useAdmisionesAccess } from '@/components/admisiones/AdmisionesAccessProvider';

type Props = {
  dictamenId: number;
  /** estado=true => abierto/pendiente, estado=false => cerrado */
  estado: boolean;
};

export default function ReabrirDictamenButton({ dictamenId, estado }: Props) {
  const router = useRouter();
  const qc = useQueryClient(); // ✅
  const { canReabrirDictamen } = useAdmisionesAccess();

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const close = () => {
    setOpen(false);
    setConfirmText('');
  };

  const canConfirm = confirmText.trim().toUpperCase() === 'REABRIR';
  const disabled = !canReabrirDictamen || estado === true;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admisiones/dictamenes/${dictamenId}/reabrir`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? 'No se pudo reabrir');
      return data;
    },
    onSuccess: async () => {
      toast.success('Dictamen reabierto correctamente');
      close();

      // ✅ refresca el listado de admisiones (React Query)
      await qc.invalidateQueries({ queryKey: ['dictamenes-admisiones'] });

      // opcional (no estorba)
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo reabrir');
    },
  });

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={[
          'inline-flex items-center justify-center rounded-full',
          'border border-blue-200 bg-white',
          'h-8 w-8',
          'text-blue-700 hover:bg-blue-50 active:bg-blue-100',
          'transition',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' ')}
        title={!canReabrirDictamen ? 'No tienes permisos' : estado ? 'Ya está abierto' : 'Reabrir dictamen'}
        aria-label="Reabrir dictamen"
      >
        <RefreshCcw className="w-4 h-4" aria-hidden="true" />
      </button>

      {open && !disabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={mutation.isPending ? undefined : close}
          />
          <div className="relative w-full max-w-sm p-4 text-left bg-white border shadow-xl rounded-2xl border-slate-200">
            <h3 className="text-sm font-semibold text-left text-slate-900">Reabrir dictamen</h3>
            <p className="mt-1 text-[11px] text-slate-500 text-left">
              Escribe <span className="font-semibold text-blue-700">REABRIR</span> para confirmar.
            </p>

            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="REABRIR"
            />

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
                className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {mutation.isPending ? 'Reabriendo…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}