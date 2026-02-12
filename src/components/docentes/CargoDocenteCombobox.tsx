'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Item = { id: number; codigo: string; nombre: string };

type Props = {
  valueId: number | null;
  valueLabel?: string; // para modo edición (mostrar el seleccionado)
  onChange: (id: number | null, label?: string) => void;
  placeholder?: string;
};

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function CargoDocenteCombobox({
  valueId,
  valueLabel,
  onChange,
  placeholder = 'Escribe mínimo 3 letras…',
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(valueLabel ?? '');
  const debounced = useDebounced(query, 300);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);

  // cerrar al click afuera
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    let alive = true;

    async function run() {
      const q = debounced.trim();
      if (q.length < 3) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/cargos-docentes/search?q=${encodeURIComponent(q)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (!alive) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [debounced]);

  const hint = useMemo(() => {
    const q = query.trim();
    if (q.length === 0) return 'Empieza a escribir…';
    if (q.length < 3) return 'Escribe mínimo 3 letras';
    if (loading) return 'Buscando…';
    if (!items.length) return 'Sin resultados';
    return '';
  }, [query, loading, items.length]);

  return (
    <div ref={boxRef} className="relative">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // si el usuario edita, el id deja de ser confiable
            onChange(null, e.target.value);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
        />

        <button
          type="button"
          onClick={() => {
            setQuery('');
            setItems([]);
            onChange(null, '');
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>

      {open && (
        <div className="absolute z-20 w-full mt-1 overflow-hidden bg-white border rounded-lg shadow-lg border-slate-200">
          {hint ? (
            <div className="px-3 py-2 text-[11px] text-slate-500">{hint}</div>
          ) : (
            <ul className="overflow-auto max-h-56">
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(`${it.nombre}`);
                      onChange(it.id, it.nombre);
                      setOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-[11px] hover:bg-slate-50"
                  >
                    <div className="font-semibold text-slate-800">{it.nombre}</div>
                    <div className="text-[10px] text-slate-500">Código: {it.codigo}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* opcional: mostrar id seleccionado */}
      {valueId ? <div className="mt-1 text-[10px] text-slate-500">Seleccionado ID: {valueId}</div> : null}
    </div>
  );
}