// src/components/dictamen/DictamenFiltersBar.tsx
'use client';

import { FC } from 'react';
import { EstadoDictamenFiltro } from './types';

export interface MedicoOption {
  id: number;
  nombre: string;
}

interface DictamenFiltersBarProps {
  // fechas
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;

  // documento del docente
  documento: string;
  onDocumentoChange: (value: string) => void;

  // estado (Pendientes, Cerrados, Todos)
  estado: EstadoDictamenFiltro;
  onEstadoChange: (value: EstadoDictamenFiltro) => void;

  // médicos
  medicos: MedicoOption[];
  medicoId: number | null;
  onMedicoChange: (id: number | null) => void;
  showMedicoSelect?: boolean; // para reutilizar en otros módulos

  // botón Registrar
  onRegistrar: () => void;
}

export const DictamenFiltersBar: FC<DictamenFiltersBarProps> = ({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  documento,
  onDocumentoChange,
  estado,
  onEstadoChange,
  medicos,
  medicoId,
  onMedicoChange,
  showMedicoSelect = true,
  onRegistrar,
}) => {
  return (
    <div className="flex flex-wrap items-end gap-3 p-3 border rounded-md shadow-sm bg-slate-50">
      {/* Fechas */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">Desde</label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => onFechaDesdeChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm min-w-[150px]"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">Hasta</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => onFechaHastaChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm min-w-[150px]"
        />
      </div>

      {/* Buscador de documento (reemplaza combo de especialidad) */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">
          Documento docente
        </label>
        <input
          type="text"
          placeholder="Buscar por documento"
          value={documento}
          onChange={(e) => onDocumentoChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm min-w-[180px]"
        />
      </div>

      {/* Select de médicos */}
      {showMedicoSelect && (
        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600">Médico</label>
          <select
            value={medicoId ?? ''}
            onChange={(e) =>
              onMedicoChange(e.target.value ? Number(e.target.value) : null)
            }
            className="border rounded px-2 py-1 text-sm min-w-[220px]"
          >
            <option value="">Seleccione...</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Estado */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">Estado</label>
        <select
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value as EstadoDictamenFiltro)}
          className="border rounded px-2 py-1 text-sm min-w-[170px]"
        >
          <option value="PENDIENTES">Pendientes (incluye re abiertos)</option>
          <option value="CERRADOS">Cerrados</option>
          <option value="TODOS">Todos</option>
        </select>
      </div>

      {/* Botón Registrar alineado a la derecha */}
      <div className="ml-auto">
        <button
          type="button"
          onClick={onRegistrar}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
        >
          Registrar
        </button>
      </div>
    </div>
  );
};
