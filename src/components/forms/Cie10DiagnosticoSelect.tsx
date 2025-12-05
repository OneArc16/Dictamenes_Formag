'use client';

import React, { useEffect, useState } from 'react';
import { useCie10Search } from '@/hooks/useCie10Search';

type Cie10DiagnosticoSelectProps = {
  /** Código CIE10 seleccionado (ej: "J45") */
  value: string;
  /** Texto que queremos mostrar cuando hay diagnóstico seleccionado (ej: "J45 - ASMA") */
  label?: string;
  /** Se dispara cuando el usuario selecciona un diagnóstico de la lista */
  onChange: (code: string, label: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function Cie10DiagnosticoSelect({
  value,
  label,
  onChange,
  placeholder = 'Buscar por código o nombre CIE10…',
  disabled,
}: Cie10DiagnosticoSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { options, loading, error, search } = useCie10Search();

  // 🧠 Texto que se debe mostrar cuando NO está abierto el dropdown
  const displayTextWhenClosed =
    label || value || '';

  // Sincronizar el texto visible cuando:
  // - cambia el código
  // - cambia el label
  // - se cierra el dropdown
  useEffect(() => {
    if (!open) {
      setQuery(displayTextWhenClosed);
    }
  }, [open, displayTextWhenClosed]);

  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  const newQuery = e.target.value;
  setQuery(newQuery);
  setOpen(true);

  if (newQuery.length >= 3) {
    search(newQuery);
  }
};


  const handleSelect = (code: string, label: string) => {
    onChange(code, label);
    setOpen(false);
    setQuery(label);
  };

  const handleBlur = () => {
    // delay para permitir click en opciones
    setTimeout(() => {
      setOpen(false);
      setQuery(displayTextWhenClosed);
    }, 150);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? query : displayTextWhenClosed}
        onChange={handleInputChange}
        onFocus={() => {
          setOpen(true);
          if (!query) {
            setQuery(displayTextWhenClosed);
          }
        }}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {open && !disabled && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-auto bg-white border rounded-md shadow-lg max-h-56">
          {/* Mensajes superiores */}
          {error && (
            <div className="px-3 py-2 text-[11px] text-red-600 bg-red-50 border-b border-red-100">
              {error}
            </div>
          )}

          {!error && query.length < 3 && (
            <div className="px-3 py-2 text-[11px] text-slate-400">
              Escribe al menos 3 caracteres para buscar.
            </div>
          )}

          {query.length >= 3 && (
            <>
              {loading && (
                <div className="px-3 py-2 text-[11px] text-slate-400">
                  Buscando…
                </div>
              )}

              {!loading && options.length === 0 && (
                <div className="px-3 py-2 text-[11px] text-slate-400">
                  Sin resultados para "{query}".
                </div>
              )}

              {!loading && options.length > 0 && (
                <ul className="py-1 text-sm">
                  {options.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-left hover:bg-blue-50"
                        onMouseDown={(e) => {
                          e.preventDefault(); // evita blur del input
                          handleSelect(opt.value, opt.label);
                        }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
