'use client';

import React from 'react';

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

type DocenteInfo = {
  documento: string;
  tipoDocumento: string;
  nombreCompleto: string;
  edad: number | null;
  secretaria: string | null;
  institucion: string | null;
};

type MedicoInfo = {
  nombreCompleto: string;
} | null;

type DictamenLeftPanelProps = {
  estado: DictamenEstado;
  docente: DocenteInfo;
  medico: MedicoInfo; // ya no lo usamos en la UI, pero dejo la prop por compatibilidad
  fechaDictamen: string; // YYYY-MM-DD o ''
  onChangeFecha: (value: string) => void;
  procedimientoPcl: 'A' | 'B';
  onChangeProcedimiento: (value: 'A' | 'B') => void;
  onEditDocente?: () => void;
};

function formatFechaHumana(fecha: string | null): string {
  if (!fecha) return '—';
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function estadoBadge(estado: DictamenEstado) {
  if (estado === 'REABIERTO') {
    return {
      label: 'Reabierto',
      classes:
        'bg-indigo-50 text-indigo-700 border border-indigo-100',
    };
  }
  if (estado === 'PENDIENTE') {
    return {
      label: 'Pendiente',
      classes:
        'bg-amber-50 text-amber-700 border border-amber-100',
    };
  }
  return {
    label: 'Cerrado',
    classes:
      'bg-emerald-50 text-emerald-700 border border-emerald-100',
  };
}

export default function DictamenLeftPanel({
  estado,
  docente,
  medico,
  fechaDictamen,
  onChangeFecha,
  procedimientoPcl,
  onChangeProcedimiento,
  onEditDocente,
}: DictamenLeftPanelProps) {
  const estadoInfo = estadoBadge(estado);

  return (
    <>
      {/* Card docente */}
      <div className="p-4 bg-white border shadow-sm rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Docente
            </h2>
            {/* Nombre COMPLETO del docente */}
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {docente.nombreCompleto}
            </p>
            <p className="text-xs text-slate-600">
              {docente.tipoDocumento} {docente.documento}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {docente.edad != null
                ? `${docente.edad} años`
                : 'Edad no registrada'}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Secretaría
            </p>
            <p className="text-xs text-slate-700">
              {docente.secretaria || 'Sin secretaría registrada'}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Institución
            </p>
            <p className="text-xs text-slate-700">
              {docente.institucion || 'Sin institución registrada'}
            </p>
          </div>

          {onEditDocente && (
            <button
              type="button"
              onClick={onEditDocente}
              className="px-3 py-1 text-xs font-semibold border rounded-full border-sky-600 text-sky-700 hover:bg-sky-50"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Card datos del dictamen */}
      <div className="p-4 bg-white border shadow-sm rounded-xl">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
          Datos del dictamen
        </h2>

        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Estado</span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${estadoInfo.classes}`}
            >
              {estadoInfo.label}
            </span>
          </div>

          <div>
            <p className="text-xs text-slate-500">Fecha de dictamen</p>
            <input
              type="date"
              value={fechaDictamen || ''}
              onChange={(e) => onChangeFecha(e.target.value)}
              className="w-full px-2 py-1 mt-1 text-xs bg-white border rounded-md border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Actual: {formatFechaHumana(fechaDictamen || null)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Procedimiento</p>
            <select
              value={procedimientoPcl}
              onChange={(e) =>
                onChangeProcedimiento(e.target.value as 'A' | 'B')
              }
              className="w-full px-2 py-1 mt-1 text-xs bg-white border rounded-md border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">Procedimiento A</option>
              <option value="B">Procedimiento B</option>
            </select>
          </div>

          {/* Bloque de "Médico" eliminado porque ya aparece en el header */}
        </div>
      </div>
    </>
  );
}
