'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';

type Props = {
  initialQ?: string;
  initialEstado?: string;
  debounceMs?: number;
};

export default function MotivosReaperturaFilters({
  initialQ = '',
  initialEstado = 'all',
  debounceMs = 350,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [estado, setEstado] = useState(initialEstado);

  const replaceQuery = (next: { q?: string; estado?: string }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    const nextQ = (next.q ?? '').trim();
    if (nextQ) params.set('q', nextQ);
    else params.delete('q');

    const nextEstado = next.estado ?? 'all';
    if (nextEstado !== 'all') params.set('estado', nextEstado);
    else params.delete('estado');

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      replaceQuery({ q, estado });
    }, debounceMs);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    replaceQuery({ q, estado });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const clearFilters = () => {
    setQ('');
    setEstado('all');
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="grid grid-cols-12 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="col-span-12 md:col-span-8">
        <label className="block text-[11px] font-medium text-slate-600">Buscar</label>
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Código, nombre o descripción…"
          className="mt-1 text-[11px]"
        />
      </div>

      <div className="col-span-12 md:col-span-4">
        <label className="block text-[11px] font-medium text-slate-600">Estado</label>
        <select
          value={estado}
          onChange={(event) => setEstado(event.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>

      <div className="col-span-12 flex justify-end">
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
