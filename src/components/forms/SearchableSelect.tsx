'use client';

import React, { useEffect, useState } from 'react';

export type SearchableOption = {
  value: string;
  label: string;
};

export type SearchableSelectProps = {
  value: string;
  options?: SearchableOption[]; // ← opcional, por si llega undefined
  // value y, opcional, la opción completa
  onChange: (value: string, option?: SearchableOption) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function SearchableSelect({
  value,
  options = [], // ← por defecto array vacío
  onChange,
  placeholder = 'Seleccione…',
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOption =
    options.find((o) => o.value === value) ?? null;

  // Cuando se cierra el dropdown, dejamos el label seleccionado en el input
  useEffect(() => {
    if (!open) {
      setQuery(selectedOption?.label ?? '');
    }
  }, [open, selectedOption?.label]);

  // Si cambia el value desde fuera, sincronizamos el texto
  useEffect(() => {
    if (!open) {
      const opt = options.find((o) => o.value === value) ?? null;
      setQuery(opt?.label ?? '');
    }
  }, [value, options, open]);

  // Filtro seguro (evita label undefined/null)
  const filteredOptions = query
    ? options.filter((o) => {
        const label = (o?.label ?? '').toString();
        return label.toLowerCase().includes(query.toLowerCase());
      })
    : options;

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value, opt); // ← pasamos también la opción completa
    setOpen(false);
    setQuery(opt.label ?? '');
  };

  const handleBlur = () => {
    // pequeño delay para permitir el click en la opción
    setTimeout(() => {
      setOpen(false);
      const opt = options.find((o) => o.value === value) ?? null;
      setQuery(opt?.label ?? '');
    }, 150);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? query : selectedOption?.label ?? query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          if (!query && selectedOption) {
            setQuery(selectedOption.label);
          }
        }}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {open && filteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-auto bg-white border rounded-md shadow-lg max-h-56">
          <ul className="py-1 text-sm">
            {filteredOptions.map((opt, index) => (
              <li key={`${opt.value}-${index}`}>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left hover:bg-blue-50"
                  onMouseDown={(e) => {
                    e.preventDefault(); // evita blur del input
                    handleSelect(opt);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
