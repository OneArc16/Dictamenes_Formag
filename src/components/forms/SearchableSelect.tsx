'use client';

import React, { useEffect, useState } from 'react';

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

  const selectedOption =
    options.find((o) => o.value === value) ?? null;

  // Sincronizar input con el value externo
  useEffect(() => {
    if (selectedOption) {
      setQuery(selectedOption.label);
    } else if (!value) {
      setQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectedOption?.label, selectedOption?.value]);

  // Filtro en cliente si NO hay búsqueda async
  const clientFilteredOptions =
    onSearch
      ? options
      : query
      ? options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        )
      : options;

  // Disparar onSearch con debounce
  useEffect(() => {
    if (!onSearch) return;
    if (query.length < minSearchLength) return;

    const id = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, minSearchLength]);

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value);
    setOpen(false);
    setQuery(opt.label);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
        }}
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
            ) : clientFilteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Sin resultados
              </div>
            ) : (
              <ul className="py-1 text-sm">
                {clientFilteredOptions.map((opt, idx) => (
                  <li key={`${opt.value}-${idx}`}>
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
            clientFilteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Sin opciones
              </div>
            ) : (
              <ul className="py-1 text-sm">
                {clientFilteredOptions.map((opt, idx) => (
                  <li key={`${opt.value}-${idx}`}>
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
