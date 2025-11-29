'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type SearchableOption = {
  value: string;
  label: string;
};

export type SearchableSelectProps = {
  value: string;
  options?: SearchableOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;

  // 🔹 Para búsquedas async en el servidor
  onSearch?: (term: string) => void;
  minSearchLength?: number;
  isLoading?: boolean;
};

export function SearchableSelect({
  value,
  options = [],
  onChange,
  placeholder = 'Seleccione…',
  disabled,
  onSearch,
  minSearchLength = 3,
  isLoading,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Opción actualmente seleccionada (si la hay)
  const selectedOption =
    options.find((o) => o.value === value) ?? null;

  // ✅ Solo sincronizamos query cuando HAY un value seleccionado
  //    (para que al escribir no se borre ni parpadee el texto)
  useEffect(() => {
    if (!value) return; // nada seleccionado, no tocamos lo que está escribiendo
    if (!options.length) return;

    const opt = options.find((o) => o.value === value) ?? null;
    if (opt) {
      setQuery(opt.label);
    }
  }, [value, options]);

  // 🔍 Filtro en cliente (solo cuando NO hay búsqueda async)
  const clientFilteredOptions =
    onSearch
      ? options
      : query
      ? options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        )
      : options;

  // 🔹 Deduplicar por value para evitar keys duplicadas
  const visibleOptions = useMemo(() => {
    const seen = new Set<string>();
    const unique: SearchableOption[] = [];

    for (const opt of clientFilteredOptions) {
      if (seen.has(opt.value)) continue;
      seen.add(opt.value);
      unique.push(opt);
    }

    return unique;
  }, [clientFilteredOptions]);

  // 🔄 Disparar onSearch (debounced) en modo async
  useEffect(() => {
    if (!onSearch) return;
    if (query.length < minSearchLength) return;

    const id = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(id);
  }, [query, onSearch, minSearchLength]);

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value);      // avisamos al padre
    setOpen(false);
    setQuery(opt.label);      // mostramos el texto elegido
  };

  const handleBlur = () => {
    // pequeño delay para permitir click en la lista
    setTimeout(() => {
      setOpen(false);

      // si hay algo seleccionado, dejamos su label;
      // si no, dejamos lo que haya escrito el usuario
      if (value && selectedOption) {
        setQuery(selectedOption.label);
      }
    }, 150);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}  // 👈 siempre query, así no cambia entre label/query
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {open && !disabled && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-auto bg-white border rounded-md shadow-lg max-h-56">
          {onSearch ? (
            // 🔹 MODO ASYNC
            query.length < minSearchLength ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Escriba al menos {minSearchLength} caracteres para buscar…
              </div>
            ) : isLoading ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Buscando…
              </div>
            ) : visibleOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Sin resultados
              </div>
            ) : (
              <ul className="py-1 text-sm">
                {visibleOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-left hover:bg-blue-50"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(opt);
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            // 🔹 MODO NORMAL
            visibleOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Sin opciones
              </div>
            ) : (
              <ul className="py-1 text-sm">
                {visibleOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-left hover:bg-blue-50"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(opt);
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      )}
    </div>
  );
}