'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  Search,
  UserCircle2,
  ChevronDown,
  Check,
  ListFilter,
} from 'lucide-react';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { EstadoDictamenFiltro } from './types';

export type MedicoOption = {
  id: number;
  nombre: string;
};

interface DictamenFiltersBarProps {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (v: string) => void;
  onFechaHastaChange: (v: string) => void;
  documento: string;
  onDocumentoChange: (v: string) => void;

  /** AHORA: múltiples estados seleccionados */
  estado: EstadoDictamenFiltro[];
  onEstadoChange: (v: EstadoDictamenFiltro[]) => void;

  /** AHORA: múltiples médicos seleccionados */
  medicos: MedicoOption[];
  medicoIds: number[];
  onMedicoChange: (ids: number[]) => void;

  showMedicoSelect?: boolean;
  onRegistrar?: () => void;
}

/* ------------------ helpers genéricos ------------------ */

function useClickOutside<T extends HTMLElement>(
  open: boolean,
  ref: RefObject<T | null>,
  onClose: () => void
) {
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, ref, onClose]);
}


/* ------------------ Multi-select médico ------------------ */

interface MedicoMultiSelectProps {
  medicos: MedicoOption[];
  medicoIds: number[];
  onChange: (ids: number[]) => void;
}

function MedicoMultiSelect({
  medicos,
  medicoIds,
  onChange,
}: MedicoMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(open, containerRef, () => setOpen(false));

  const selected = medicos.filter((m) => medicoIds.includes(m.id));
  const allSelected = medicos.length > 0 && selected.length === medicos.length;

  const toggleMedico = (id: number) => {
    if (medicoIds.includes(id)) {
      onChange(medicoIds.filter((x) => x !== id));
    } else {
      onChange([...medicoIds, id]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(medicos.map((m) => m.id));
    }
  };

  let label = 'Todos los médicos';
  if (selected.length === 1) {
    label = selected[0].nombre;
  } else if (selected.length > 1) {
    label = `${selected[0].nombre} + ${selected.length - 1} más`;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
      >
        <UserCircle2 className="w-4 h-4 text-slate-500" />
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg border-slate-200 shadow-slate-200/70">
          <ul className="py-1 overflow-auto text-xs max-h-64">
            {medicos.length > 1 && (
              <li>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex-1 truncate">
                    {allSelected ? 'Quitar todos' : 'Marcar todos'}
                  </span>
                  {allSelected && (
                    <Check className="h-3.5 w-3.5 text-blue-600" />
                  )}
                </button>
              </li>
            )}

            {medicos.length === 0 && (
              <li className="px-3 py-2 text-[11px] text-slate-500">
                No hay médicos configurados
              </li>
            )}

            {medicos.map((m) => {
              const isSelected = medicoIds.includes(m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => toggleMedico(m.id)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex-1 truncate">{m.nombre}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------ Multi-select estado ------------------ */

const ESTADO_OPTIONS: { value: EstadoDictamenFiltro; label: string }[] = [
  { value: 'PENDIENTES', label: 'Pendientes' },
  { value: 'REABIERTOS', label: 'Reabiertos' },
  { value: 'CERRADOS', label: 'Cerrados' },
  { value: 'TODOS', label: 'Todos' },
];


interface EstadoMultiSelectProps {
  value: EstadoDictamenFiltro[];
  onChange: (v: EstadoDictamenFiltro[]) => void;
}

function EstadoMultiSelect({ value, onChange }: EstadoMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(open, containerRef, () => setOpen(false));

  const selected = ESTADO_OPTIONS.filter((opt) => value.includes(opt.value));
  const allSelected = selected.length === ESTADO_OPTIONS.length;

  const toggleEstado = (val: EstadoDictamenFiltro) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(ESTADO_OPTIONS.map((o) => o.value));
    }
  };

  let label = 'Todos los estados';
  if (selected.length === 1) {
    label = selected[0].label;
  } else if (selected.length > 1) {
    label = `${selected[0].label} + ${selected.length - 1} más`;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
      >
        <ListFilter className="w-4 h-4 text-slate-500" />
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg border-slate-200 shadow-slate-200/70">
          <ul className="py-1 overflow-auto text-xs max-h-64">
            <li>
              <button
                type="button"
                onClick={toggleAll}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="flex-1 truncate">
                  {allSelected ? 'Quitar todos' : 'Marcar todos'}
                </span>
                {allSelected && (
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                )}
              </button>
            </li>

            {ESTADO_OPTIONS.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => toggleEstado(opt.value)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------ Barra de filtros ------------------ */

export function DictamenFiltersBar({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  documento,
  onDocumentoChange,
  estado,
  onEstadoChange,
  medicos,
  medicoIds,
  onMedicoChange,
  showMedicoSelect = true,
  onRegistrar,
}: DictamenFiltersBarProps) {
  return (
    <div className="px-3 py-3 bg-white border shadow-sm rounded-xl border-slate-200">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        {/* Filtros izquierdos */}
        <div
          className={`grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 ${
            showMedicoSelect ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          }`}
        >
          <DateRangePicker
            from={fechaDesde}
            to={fechaHasta}
            onFromChange={onFechaDesdeChange}
            onToChange={onFechaHastaChange}
          />

          {/* Documento docente */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-600">
              Documento docente
            </label>
            <div className="relative">
              <input
                type="text"
                value={documento}
                onChange={(e) => onDocumentoChange(e.target.value)}
                placeholder="Buscar por documento"
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
              />
              <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Médico (multi-select) */}
          {showMedicoSelect && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-600">
                Médico
              </label>
              <MedicoMultiSelect
                medicos={medicos}
                medicoIds={medicoIds}
                onChange={onMedicoChange}
              />
            </div>
          )}

          {/* Estado (multi-select) */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-600">
              Estado
            </label>
            <EstadoMultiSelect value={estado} onChange={onEstadoChange} />
          </div>
        </div>

        {/* Botón Registrar */}
        {onRegistrar && (
          <div className="flex justify-end mt-2 lg:mt-0">
            <button
              type="button"
              onClick={onRegistrar}
              className="inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
            >
              Registrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
