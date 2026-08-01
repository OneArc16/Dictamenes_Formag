'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

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
  id?: string;
  className?: string;

  onSearch?: (term: string) => void;
  minSearchLength?: number;
  isLoading?: boolean;
};

function norm(s: string) {
  return (s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function SearchableSelect({
  value,
  options = [],
  onChange,
  placeholder = 'Seleccione…',
  disabled,
  id,
  className,
  onSearch,
  minSearchLength = 3,
  isLoading,
}: SearchableSelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  // Sincronizar input con el value externo
  useEffect(() => {
    if (selectedOption) {
      setQuery(selectedOption.label);
    } else if (!value) {
      setQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectedOption?.label, selectedOption?.value]);

  // Filtro en cliente si NO hay búsqueda async (con normalización sin tildes)
  const clientFilteredOptions = useMemo(() => {
    if (onSearch) return options;

    const q = norm(query);
    if (!q) return options;

    return options.filter((o) => norm(o.label).includes(q));
  }, [options, onSearch, query]);

  // Disparar onSearch con debounce
  useEffect(() => {
    if (!onSearch) return;

    const q = query.trim();
    if (q.length < minSearchLength) return;

    const id = setTimeout(() => {
      onSearch(q);
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
    setTimeout(() => setOpen(false), 150);
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
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
        disabled={disabled}
        placeholder={placeholder}
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && !disabled}
        aria-controls={listboxId}
        autoComplete="off"
        className={cn('h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500', className)}
      />

      {open && !disabled && (
        <div id={listboxId} role="listbox" className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border bg-white shadow-lg">
          {onSearch ? (
            query.trim().length < minSearchLength ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Escriba al menos {minSearchLength} caracteres para buscar…
              </div>
            ) : isLoading ? (
              <div className="px-3 py-2 text-xs text-slate-500">Buscando…</div>
            ) : options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">Sin resultados</div>
            ) : (
              <ul className="py-1 text-sm">
                {options.map((opt, idx) => (
                  <li key={`${opt.value}-${idx}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={opt.value === value}
                      className="w-full cursor-pointer px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
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
          ) : clientFilteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500">Sin opciones</div>
          ) : (
            <ul className="py-1 text-sm">
              {clientFilteredOptions.map((opt, idx) => (
                <li key={`${opt.value}-${idx}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    className="w-full cursor-pointer px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
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
          )}
        </div>
      )}
    </div>
  );
}
