'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';

type Props = {
  initialQ?: string;
  initialTipo?: string;
  initialModulo?: string;
  initialFechaDesde?: string;
  initialFechaHasta?: string;
  debounceMs?: number;
};

export default function RecomendacionesAuditoriaFilters({
  initialQ = '',
  initialTipo = 'all',
  initialModulo = 'RECOMENDACIONES',
  initialFechaDesde = '',
  initialFechaHasta = '',
  debounceMs = 350,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [tipo, setTipo] = useState(initialTipo);
  const [modulo, setModulo] = useState(initialModulo);
  const [fechaDesde, setFechaDesde] = useState(initialFechaDesde);
  const [fechaHasta, setFechaHasta] = useState(initialFechaHasta);

  const replaceQuery = (next: {
    q?: string;
    tipo?: string;
    modulo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    const nextQ = (next.q ?? '').trim();
    if (nextQ) params.set('q', nextQ);
    else params.delete('q');

    const nextTipo = next.tipo ?? 'all';
    if (nextTipo !== 'all') params.set('tipo', nextTipo);
    else params.delete('tipo');

    const nextModulo = (next.modulo ?? 'RECOMENDACIONES').trim().toUpperCase();
    if (nextModulo && nextModulo !== 'RECOMENDACIONES') params.set('modulo', nextModulo);
    else params.delete('modulo');

    const nextFechaDesde = (next.fechaDesde ?? '').trim();
    if (nextFechaDesde) params.set('fechaDesde', nextFechaDesde);
    else params.delete('fechaDesde');

    const nextFechaHasta = (next.fechaHasta ?? '').trim();
    if (nextFechaHasta) params.set('fechaHasta', nextFechaHasta);
    else params.delete('fechaHasta');

    params.delete('page');

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      replaceQuery({ q, tipo, modulo, fechaDesde, fechaHasta });
    }, debounceMs);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    replaceQuery({ q, tipo, modulo, fechaDesde, fechaHasta });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, modulo, fechaDesde, fechaHasta]);

  const clearFilters = () => {
    setQ('');
    setTipo('all');
    setModulo('RECOMENDACIONES');
    setFechaDesde('');
    setFechaHasta('');
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="grid grid-cols-12 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="col-span-12 md:col-span-4">
        <label className="block text-[11px] font-medium text-slate-600">Buscar</label>
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Docente, documento, actor, motivo o numero..."
          className="mt-1 text-[11px]"
        />
      </div>

      <div className="col-span-12 md:col-span-2">
        <label className="block text-[11px] font-medium text-slate-600">Modulo</label>
        <select
          value={modulo}
          onChange={(event) => setModulo(event.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="RECOMENDACIONES">Recomendaciones</option>
          <option value="DICTAMENES">Dictamenes</option>
        </select>
      </div>

      <div className="col-span-12 md:col-span-2">
        <label className="block text-[11px] font-medium text-slate-600">Evento</label>
        <select
          value={tipo}
          onChange={(event) => setTipo(event.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Todos</option>
          <option value="REAPERTURA">Reaperturas</option>
          <option value="EDICION">Ediciones</option>
          <option value="CIERRE">Cierres</option>
        </select>
      </div>

      <div className="col-span-6 md:col-span-2">
        <label className="block text-[11px] font-medium text-slate-600">Desde</label>
        <Input
          type="date"
          value={fechaDesde}
          onChange={(event) => setFechaDesde(event.target.value)}
          className="mt-1 text-[11px]"
        />
      </div>

      <div className="col-span-6 md:col-span-2">
        <label className="block text-[11px] font-medium text-slate-600">Hasta</label>
        <Input
          type="date"
          value={fechaHasta}
          onChange={(event) => setFechaHasta(event.target.value)}
          className="mt-1 text-[11px]"
        />
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
