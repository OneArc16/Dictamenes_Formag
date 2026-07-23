import { useEffect, useId, useState } from 'react';

import { inputClassName } from './FormField';

type Option = { id: number; label: string };

export function AsyncCatalogInput({
  id,
  value,
  disabled,
  endpoint,
  responseKey,
  placeholder,
  minSearchLength = 5,
  onChange,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  endpoint: string;
  responseKey: string;
  placeholder: string;
  minSearchLength?: number;
  onChange: (value: string, option: Option | null) => void;
}) {
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;
  const helperId = `${generatedId}-helper`;
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchFailed, setSearchFailed] = useState(false);
  const query = value.trim();

  useEffect(() => {
    if (disabled || query.length < minSearchLength) {
      setOptions([]);
      setLoading(false);
      setSearchFailed(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setSearchFailed(false);
      try {
        const separator = endpoint.includes('?') ? '&' : '?';
        const response = await fetch(
          `${endpoint}${separator}q=${encodeURIComponent(query)}`,
          { signal: controller.signal, credentials: 'include' },
        );
        if (!response.ok) {
          throw new Error('No fue posible consultar el catálogo.');
        }
        const data = await response.json();
        const rows = Array.isArray(data?.[responseKey]) ? data[responseKey] : [];
        const nextOptions = rows
          .map((row: Record<string, unknown>) => ({
            id: Number(row.id),
            label: String(row.nombre ?? row.label ?? ''),
          }))
          .filter((row: Option) => Number.isFinite(row.id) && row.label);

        setOptions(nextOptions);
        setActiveIndex(nextOptions.length > 0 ? 0 : -1);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setOptions([]);
          setActiveIndex(-1);
          setSearchFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [disabled, endpoint, minSearchLength, query, responseKey]);

  const selectOption = (option: Option) => {
    onChange(option.label, option);
    setOpen(false);
    setActiveIndex(-1);
  };

  const remainingCharacters = Math.max(minSearchLength - query.length, 0);
  const showListbox = open && !disabled && query.length >= minSearchLength;
  const helperText = loading
    ? 'Buscando coincidencias…'
    : query.length < minSearchLength
      ? query.length === 0
        ? `Escribe al menos ${minSearchLength} caracteres para buscar.`
        : `Escribe ${remainingCharacters} ${
            remainingCharacters === 1 ? 'carácter' : 'caracteres'
          } más para buscar.`
      : searchFailed
        ? 'No fue posible consultar el catálogo. Intenta nuevamente.'
        : options.length === 0
          ? 'No hay coincidencias. Puedes conservar el texto histórico.'
          : `${options.length} ${
              options.length === 1 ? 'opción disponible' : 'opciones disponibles'
            }.`;

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-describedby={helperId}
        aria-expanded={showListbox}
        aria-activedescendant={
          showListbox && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        onChange={(event) => {
          const next = event.target.value;
          const selected = options.find((option) => option.label === next) ?? null;
          const canSearch = next.trim().length >= minSearchLength;

          setOpen(canSearch);
          setActiveIndex(-1);
          onChange(next, selected);
        }}
        onFocus={() => {
          if (query.length >= minSearchLength) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            setActiveIndex(-1);
            return;
          }

          if (!showListbox || options.length === 0) return;

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((current) => (current + 1) % options.length);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex(
              (current) => (current <= 0 ? options.length - 1 : current - 1),
            );
          } else if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            selectOption(options[activeIndex]);
          }
        }}
        className={inputClassName}
      />

      {showListbox ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {loading ? (
            <p className="px-3 py-2 text-sm text-slate-500">Buscando…</p>
          ) : searchFailed ? (
            <p className="px-3 py-2 text-sm text-rose-700">
              No fue posible cargar las opciones.
            </p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">
              Sin coincidencias. Puedes conservar el texto escrito.
            </p>
          ) : (
            options.map((option, index) => (
              <button
                key={option.id}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                className={`block min-h-11 w-full cursor-pointer px-3 py-2 text-left text-sm text-slate-900 transition-colors ${
                  activeIndex === index
                    ? 'bg-sky-50 text-sky-950'
                    : 'hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      ) : null}

      <p
        id={helperId}
        className={`mt-1 text-xs ${
          searchFailed ? 'text-rose-700' : 'text-slate-500'
        }`}
        aria-live="polite"
      >
        {helperText}
      </p>
    </div>
  );
}
