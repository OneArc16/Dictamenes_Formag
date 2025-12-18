'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type PerfilOption = { id: number; nombre: string };

type Props = {
  perfiles: PerfilOption[];
  initialQ?: string;
  initialActivo?: string;   // 'all' | '1' | '0'
  initialPerfilId?: string; // 'all' | id
  debounceMs?: number;
};

export default function EmpleadosFilters({
  perfiles,
  initialQ = '',
  initialActivo = 'all',
  initialPerfilId = 'all',
  debounceMs = 350,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [activo, setActivo] = useState(initialActivo);
  const [perfilId, setPerfilId] = useState(initialPerfilId);

  const replaceQuery = (next: { q?: string; activo?: string; perfilId?: string }) => {
    const params = new URLSearchParams(sp?.toString() ?? '');

    // q
    const nq = (next.q ?? '').trim();
    if (nq) params.set('q', nq);
    else params.delete('q');

    // activo
    const na = next.activo ?? 'all';
    if (na && na !== 'all') params.set('activo', na);
    else params.delete('activo');

    // perfilId
    const np = next.perfilId ?? 'all';
    if (np && np !== 'all') params.set('perfilId', np);
    else params.delete('perfilId');

    // ✅ IMPORTANTE: si cambian filtros/búsqueda, volvemos a página 1
    params.delete('page');

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // ✅ búsqueda mientras escribe (debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      replaceQuery({ q, activo, perfilId });
    }, debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // selects: inmediato
  useEffect(() => {
    replaceQuery({ q, activo, perfilId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, perfilId]);

  const clear = () => {
    setQ('');
    setActivo('all');
    setPerfilId('all');
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="grid grid-cols-12 gap-2 p-3 bg-white border shadow-sm rounded-xl border-slate-200">
      <div className="col-span-12 md:col-span-6">
        <label className="block text-[11px] font-medium text-slate-600">Buscar</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, apellido, email o documento…"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      <div className="col-span-6 md:col-span-3">
        <label className="block text-[11px] font-medium text-slate-600">Activo</label>
        <select
          value={activo}
          onChange={(e) => setActivo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>

      <div className="col-span-6 md:col-span-3">
        <label className="block text-[11px] font-medium text-slate-600">Perfil</label>
        <select
          value={perfilId}
          onChange={(e) => setPerfilId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">Todos</option>
          {perfiles.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.nombre}
            </option>
          ))}
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
