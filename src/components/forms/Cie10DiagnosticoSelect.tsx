'use client';

import React, { useEffect, useState } from 'react';
import {
  SearchableOption,
} from '@/components/forms/SearchableSelect'; // solo para el tipo
import { useCie10Search } from '@/hooks/useCie10Search';

type Cie10DiagnosticoSelectProps = {
  value: string; // código CIE10
  onChange: (value: string, option?: SearchableOption) => void;
  placeholder?: string;
  /** Etiqueta inicial, por ejemplo: "I10X - HIPERTENSIÓN ESENCIAL" */
  initialLabel?: string;
};

export function Cie10DiagnosticoSelect({
  value,
  onChange,
  placeholder = 'Buscar por código o nombre CIE10…',
  initialLabel,
}: Cie10DiagnosticoSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Label “estable” que mostramos cuando el input está cerrado
  const [displayLabel, setDisplayLabel] = useState<string>(
    initialLabel ?? value ?? ''
  );

  const {
    options,
    loading,
    error,
    search,
  } = useCie10Search();

  // Cuando cambia el value o la initialLabel desde fuera
  useEffect(() => {
    if (!value) {
      setDisplayLabel('');
      return;
    }
    setDisplayLabel(initialLabel ?? value);
  }, [value, initialLabel]);

  // Cuando se cierra el dropdown, dejamos el label seleccionado en el input
  useEffect(() => {
    if (!open) {
      setQuery(displayLabel ?? '');
    }
  }, [open, displayLabel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);

    // solo buscamos si hay al menos 3 caracteres
    if (q.trim().length >= 3) {
      search(q.trim());
    }
  };

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value, opt);
    setDisplayLabel(opt.label ?? opt.value);
    setOpen(false);
    setQuery(opt.label ?? opt.value);
  };

  const handleBlur = () => {
    // pequeño delay para permitir el click en la opción
    setTimeout(() => {
      setOpen(false);
      setQuery(displayLabel ?? '');
    }, 150);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? query : displayLabel}
        onChange={handleInputChange}
        onFocus={() => {
          setOpen(true);
          if (!query && displayLabel) {
            setQuery(displayLabel);
          }
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Mensaje de ayuda cuando escribe menos de 3 caracteres */}
      {open && query.trim().length > 0 && query.trim().length < 3 && (
        <div className="absolute left-0 right-0 z-20 mt-1 px-3 py-2 text-[11px] text-slate-500 bg-white border rounded-md shadow-sm">
          Escribe al menos 3 caracteres para buscar en el catálogo CIE10.
        </div>
      )}

      {open && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-auto bg-white border rounded-md shadow-lg max-h-56">
          {loading && (
            <div className="px-3 py-2 text-[11px] text-slate-500">
              Buscando CIE10…
            </div>
          )}

          {!loading && options.length === 0 && (
            <div className="px-3 py-2 text-[11px] text-slate-500">
              No se encontraron diagnósticos para “{query}”.
            </div>
          )}

          {!loading && options.length > 0 && (
            <ul className="py-1 text-sm">
              {options.map((opt, index) => (
                <li key={`${opt.value}-${index}`}>
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 text-left hover:bg-blue-50"
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
