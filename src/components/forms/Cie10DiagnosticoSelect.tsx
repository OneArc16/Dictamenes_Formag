'use client';

import React, { useEffect, useRef, useState } from 'react';

import { nextHighlightedIndex, type SearchableOption } from '@/components/forms/SearchableSelect';
import { useCie10Search } from '@/hooks/useCie10Search';

type Cie10DiagnosticoSelectProps = {
  value: string; // código CIE10
  onChange: (value: string, option?: SearchableOption) => void;
  inputId?: string;
  placeholder?: string;
  /** Etiqueta inicial, por ejemplo: "I10X - HIPERTENSIÓN ESENCIAL" */
  initialLabel?: string;
  disabled?: boolean;
  /** Para buscar en otro catálogo con la misma respuesta (p. ej. CUPS). */
  endpoint?: string;
  catalogLabel?: string;
};

export function Cie10DiagnosticoSelect({
  value,
  onChange,
  inputId,
  placeholder = 'Buscar por código o nombre CIE10…',
  initialLabel,
  disabled = false,
  endpoint,
  catalogLabel = 'CIE10',
}: Cie10DiagnosticoSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [localSelection, setLocalSelection] =
    useState<SearchableOption | null>(null);
  const listboxId = `${inputId ?? 'cie10-diagnostico'}-listbox`;
  const displayLabel =
    localSelection?.value === value
      ? localSelection.label
      : initialLabel ?? value ?? '';

  const {
    options,
    loading,
    error,
    search,
  } = useCie10Search(endpoint);
  const activeIndex = highlightedIndex < options.length ? highlightedIndex : -1;

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open, options.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    setHighlightedIndex(-1);

    // solo buscamos si hay al menos 3 caracteres
    if (q.trim().length >= 3) {
      search(q.trim());
    }
  };

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value, opt);
    setLocalSelection(opt);
    setOpen(false);
    setHighlightedIndex(-1);
    setQuery(opt.label ?? opt.value);
  };

  const handleBlur = () => {
    // pequeño delay para permitir el click en la opción
    setTimeout(() => {
      setOpen(false);
      setHighlightedIndex(-1);
      setQuery(displayLabel ?? '');
    }, 150);
  };

  return (
    <div className="relative">
      <input
        id={inputId}
        type="text"
        value={open ? query : displayLabel}
        onChange={handleInputChange}
        onFocus={() => {
          if (disabled) return;
          setOpen(true);
          setQuery(displayLabel);
        }}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            setHighlightedIndex(-1);
            return;
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (query.trim().length < 3 || options.length === 0) return;
            event.preventDefault();
            setOpen(true);
            setHighlightedIndex((currentIndex) => nextHighlightedIndex(
              currentIndex,
              event.key === 'ArrowDown' ? 1 : -1,
              options.length,
            ));
            return;
          }
          if (event.key === 'Enter' && open && activeIndex >= 0) {
            const option = options[activeIndex];
            if (!option) return;
            event.preventDefault();
            handleSelect(option);
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && !disabled}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      />

      {/* Mensaje de ayuda cuando escribe menos de 3 caracteres */}
      {open && query.trim().length > 0 && query.trim().length < 3 && (
        <div className="absolute left-0 right-0 z-20 mt-1 px-3 py-2 text-[11px] text-slate-500 bg-white border rounded-md shadow-sm">
          Escribe al menos 3 caracteres para buscar en el catálogo {catalogLabel}.
        </div>
      )}

      {open && query.trim().length >= 3 && (
        <div id={listboxId} role="listbox" className="absolute left-0 right-0 z-20 mt-1 overflow-auto bg-white border rounded-md shadow-lg max-h-56">
          {loading && (
            <div className="px-3 py-2 text-[11px] text-slate-500">
              Buscando {catalogLabel}…
            </div>
          )}

          {!loading && options.length === 0 && (
            <div className="px-3 py-2 text-[11px] text-slate-500">
              No se encontraron resultados para “{query}”.
            </div>
          )}

          {!loading && options.length > 0 && (
            <ul className="py-1 text-sm">
              {options.map((opt, index) => (
                <li key={`${opt.value}-${index}`}>
                  <button
                    type="button"
                    id={`${listboxId}-option-${index}`}
                    ref={(element) => { optionRefs.current[index] = element; }}
                    role="option"
                    aria-selected={opt.value === value}
                    className={`w-full px-3 py-1.5 text-left hover:bg-blue-50 ${activeIndex === index ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // evita blur
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

      {error && (
        <p className="mt-1 text-[11px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
