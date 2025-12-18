'use client';

import { Eye } from 'lucide-react';
import { DictamenRow } from './types';

interface DictamenTableProps {
  rows: DictamenRow[];
  loading: boolean;
  onOpenDictamen: (id: number) => void;
  renderActions?: (row: DictamenRow) => React.ReactNode;
}

// Helper para formatear la fecha
function formatFecha(value: any): string {
  if (!value) return '';

  if (value instanceof Date) {
    return value.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  const str = String(value);

  // ISO con hora
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  }

  // YYYY-MM-DD
  const base = str.split('T')[0];
  const parts = base.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y.length === 4) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }

  return str;
}

export function DictamenTable({
  rows,
  loading,
  onOpenDictamen,
  renderActions,
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
                Secretaría
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Documento
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Docente
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Estado
              </th>
              <th className="px-3 py-2 font-semibold text-left text-slate-500">
                Médico
              </th>
              <th className="w-24 px-3 py-2 font-semibold text-right text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-xs text-center text-slate-500"
                >
                  Cargando dictámenes...
                </td>
              </tr>
            )}

            {!loading && !hasRows && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-xs text-center text-slate-500"
                >
                  No hay dictámenes para los filtros seleccionados.
                </td>
              </tr>
            )}

            {!loading &&
              hasRows &&
              rows.map((row, index) => {
                const numero = index + 1;

                // 🔹 Soportar tanto el shape nuevo como el anterior
                const anyRow = row as any;
                const fechaValue = anyRow.fecha ?? row.fechaDictamen;
                const fechaStr = formatFecha(fechaValue);

                const documento =
                  anyRow.documento ?? row.docenteDocumento ?? '';
                const docenteNombre =
                  anyRow.docente ?? row.docenteNombre ?? '';
                const medicoNombre =
                  anyRow.medico ?? row.medicoNombre ?? '';
                const secretaria = anyRow.secretaria ?? row.secretaria ?? '';

                const estadoRaw = anyRow.estado ?? row.estado;
                const estadoUpper = estadoRaw?.toUpperCase();
                const isPendiente = estadoUpper === 'PENDIENTE';
                const isReabierto = estadoUpper === 'REABIERTO';

                let estadoLabel = 'Cerrado';
                let estadoClasses =
                  'bg-emerald-50 text-emerald-700 border border-emerald-100';

                if (isPendiente) {
                  estadoLabel = 'Pendiente';
                  estadoClasses =
                    'bg-amber-50 text-amber-700 border border-amber-100';
                } else if (isReabierto) {
                  estadoLabel = 'Reabierto';
                  estadoClasses =
                    'bg-indigo-50 text-indigo-700 border border-indigo-100';
                }

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 text-[11px] text-slate-500">
                      {numero}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {fechaStr}
                    </td>
                    {/* 🔹 Secretaría */}
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {secretaria || '—'}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {documento}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {docenteNombre}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${estadoClasses}`}
                      >
                        {estadoLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {medicoNombre}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {renderActions ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          {renderActions(row)}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenDictamen(row.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-500/70 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-600 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ver</span>
                        </button>
                      )}
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
