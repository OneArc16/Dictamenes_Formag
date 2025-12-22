'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Props = {
  initialQ?: string;
  initialEstado?: string; // all | 1 | 0
  debounceMs?: number;
};

export default function PerfilesFilters({
  initialQ = '',
  initialEstado = 'all',
  debounceMs = 350,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [estado, setEstado] = useState(initialEstado);

  const replaceQuery = (next: { q?: string; estado?: string }) => {
    const params = new URLSearchParams(sp?.toString() ?? '');

    const nq = (next.q ?? '').trim();
    if (nq) params.set('q', nq);
    else params.delete('q');

    const ne = next.estado ?? 'all';
    if (ne && ne !== 'all') params.set('estado', ne);
    else params.delete('estado');

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    const t = setTimeout(() => replaceQuery({ q, estado }), debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    replaceQuery({ q, estado });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const clear = () => {
    setQ('');
    setEstado('all');
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="grid grid-cols-12 gap-2 p-3 bg-white border shadow-sm rounded-xl border-slate-200">
      <div className="col-span-12 md:col-span-8">
        <label className="block text-[11px] font-medium text-slate-600">Buscar</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre del perfil…"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      <div className="col-span-12 md:col-span-4">
        <label className="block text-[11px] font-medium text-slate-600">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>

      <div className="flex justify-end col-span-12">
        <button
          type="button"
          onClick={clear}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
