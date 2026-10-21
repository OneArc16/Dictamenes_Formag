'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

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

  // `onSearch` suele recrearse en cada render del padre: se guarda en una ref para que el
  // debounce dependa solo del texto escrito. Si dependiera de su identidad, cada búsqueda
  // terminada re-renderizaría al padre, reprogramaría el efecto y lanzaría la misma búsqueda
  // otra vez en bucle (la lista parpadeaba entre "Buscando…" y los resultados).
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });
  const hasSearch = Boolean(onSearch);
  const lastSearchedRef = useRef<string | null>(null);

  // Disparar onSearch con debounce
  useEffect(() => {
    if (!hasSearch) return;

    const q = query.trim();
    if (q.length < minSearchLength) {
      lastSearchedRef.current = null;
      return;
    }
    // Sincronizar la etiqueta de una opción ya seleccionada no es una nueva
    // intención de búsqueda. Evita ciclos etiqueta -> consulta -> etiqueta.
    if (value && selectedOption && norm(q) === norm(selectedOption.label)) return;
    // Ya se buscó este mismo texto: no repetir la consulta.
    if (lastSearchedRef.current === q) return;

    const id = setTimeout(() => {
      lastSearchedRef.current = q;
      onSearchRef.current?.(q);
    }, 300);

    return () => clearTimeout(id);
  }, [hasSearch, minSearchLength, query, selectedOption, value]);

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
            ) : options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">{isLoading ? 'Buscando…' : 'Sin resultados'}</div>
            ) : (
              <ul className={cn('py-1 text-sm', isLoading && 'opacity-60')}>
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
