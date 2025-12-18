// src/components/dictamen/ReabrirDictamenButton.tsx
'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function ReabrirDictamenButton({ dictamenId }: { dictamenId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const canConfirm = useMemo(() => confirmText.trim().toUpperCase() === 'REABRIR', [confirmText]);

  const m = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/dictamenes/${dictamenId}/reabrir`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'No se pudo reabrir');
      return data;
    },
    onSuccess: async () => {
      toast.success('Dictamen reabierto');
      setOpen(false);
      setConfirmText('');
      await qc.invalidateQueries({ queryKey: ['dictamen', dictamenId] });
      await qc.invalidateQueries({ queryKey: ['dictamenes'] }); // si usas key global en listados
    },
    onError: (e: any) => toast.error(e?.message ?? 'Error reabriendo dictamen'),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-[11px] font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100"
      >
        Reabrir
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="w-full max-w-md p-5 bg-white shadow-xl rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-900">Reabrir dictamen</h3>

            {/* ✅ mensaje a la izquierda */}
            <p className="mt-1 text-left text-[11px] text-slate-500">
              Escribe <b>REABRIR</b> para confirmar.
            </p>

            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="REABRIR"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-indigo-500/40"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirmText('');
                }}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={!canConfirm || m.isPending}
                onClick={() => m.mutate()}
                className="rounded-full bg-indigo-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm disabled:opacity-50 hover:bg-indigo-700"
              >
                {m.isPending ? 'Reabriendo…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
