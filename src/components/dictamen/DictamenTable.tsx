// src/components/dictamen/DictamenTable.tsx
'use client';

import { Eye } from 'lucide-react';
import { DictamenRow } from './types';

interface DictamenTableProps {
  rows: DictamenRow[];
  loading: boolean;
  onOpenDictamen: (id: number) => void;
}

// Helper para formatear la fecha
function formatFecha(value: any): string {
  if (!value) return '';

  // Si viene como Date
  if (value instanceof Date) {
    return value.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  const str = String(value);

  // Si viene como ISO con hora: 2025-11-15T00:00:00.000Z
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      // Usamos UTC para que no se corra un día por la zona horaria
      return d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  }

  // Si viene como YYYY-MM-DD
  const base = str.split('T')[0]; // nos quedamos con la parte de la fecha
  const parts = base.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y.length === 4) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }

  // Fallback
  return str;
}

export function DictamenTable({
  rows,
  loading,
  onOpenDictamen,
}: DictamenTableProps) {
  const hasRows = rows && rows.length > 0;

  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="border-b bg-slate-50 border-slate-200">
            <tr>
              <th className="w-10 px-3 py-2 font-semibold text-left text-slate-500">
                #
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Fecha
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Documento
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Docente
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Procedimiento
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Estado
              </th>
              <th className="px-3 py-2 font-semibold text-center text-slate-500">
                % Título I
              </th>
              <th className="px-3 py-2 font-semibold text-center text-slate-500">
                % Título III
              </th>
              <th className="px-3 py-2 font-semibold text-right text-slate-500 w-28">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-xs text-center text-slate-500"
                >
                  Cargando dictámenes...
                </td>
              </tr>
            )}

            {!loading && !hasRows && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-xs text-center text-slate-500"
                >
                  No hay dictámenes para los filtros seleccionados.
                </td>
              </tr>
            )}

            {!loading &&
              hasRows &&
              rows.map((row) => {
                const numero = row.numeroDictamen ?? row.id;

                const fechaStr = formatFecha(row.fechaDictamen);

                const titulo1 =
                  row.totalTitulo1 === null || row.totalTitulo1 === undefined
                    ? '-'
                    : String(row.totalTitulo1);

                const titulo3 =
                  row.totalTitulo3 === null || row.totalTitulo3 === undefined
                    ? '-'
                    : String(row.totalTitulo3);

                const isPendiente =
                  row.estado?.toUpperCase() === 'PENDIENTE';

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 text-[11px] text-slate-500">
                      {numero}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {fechaStr}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {row.docenteDocumento}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {row.docenteNombre}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {row.procedimientoPcl}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          isPendiente
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}
                      >
                        {isPendiente ? 'Pendiente' : 'Cerrado'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-[11px] text-slate-700">
                      {titulo1}
                    </td>
                    <td className="px-3 py-2 text-center text-[11px] text-slate-700">
                      {titulo3}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenDictamen(row.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-500/70 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-600 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
