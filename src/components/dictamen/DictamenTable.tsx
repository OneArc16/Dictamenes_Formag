// src/components/dictamen/DictamenTable.tsx
'use client';

import { FC } from 'react';
import { DictamenRow } from './types';
import { EstadoBadge } from './EstadoBadge';

interface DictamenTableProps {
  rows: DictamenRow[];
  loading?: boolean;
  onOpenDictamen?: (id: number) => void;
}

export const DictamenTable: FC<DictamenTableProps> = ({
  rows,
  loading = false,
  onOpenDictamen,
}) => {
  return (
    <div className="overflow-hidden bg-white border rounded-md shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-2 py-2 font-medium text-left text-slate-700">#</th>
            <th className="px-2 py-2 font-medium text-left text-slate-700">
              Fecha
            </th>
            <th className="px-2 py-2 font-medium text-left text-slate-700">
              Documento
            </th>
            <th className="px-2 py-2 font-medium text-left text-slate-700">
              Docente
            </th>
            <th className="px-2 py-2 font-medium text-left text-slate-700">
              Procedimiento
            </th>
            <th className="px-2 py-2 font-medium text-left text-slate-700">
              Estado
            </th>
            <th className="px-2 py-2 font-medium text-left text-slate-700">
              % Título I
            </th>
            <th className="px-2 py-2 font-medium text-left text-slate-700">
              % Título III
            </th>
            <th className="px-2 py-2 font-medium text-left text-slate-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={9}
                className="px-4 py-6 text-sm text-center text-slate-500"
              >
                Cargando dictámenes...
              </td>
            </tr>
          )}

          {!loading && rows.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="px-4 py-6 text-sm text-center text-slate-500"
              >
                No hay dictámenes para los filtros seleccionados.
              </td>
            </tr>
          )}

          {!loading &&
            rows.map((row) => {
              const fecha =
                row.fechaDictamen instanceof Date
                  ? row.fechaDictamen
                  : new Date(row.fechaDictamen);

              return (
                <tr
                  key={row.id}
                  className="transition-colors border-t hover:bg-slate-50"
                >
                  <td className="px-2 py-1 align-middle">
                    {row.numeroDictamen ?? row.id}
                  </td>
                  <td className="px-2 py-1 align-middle">
                    {fecha.toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-2 py-1 align-middle">
                    {row.docenteDocumento}
                  </td>
                  <td className="px-2 py-1 align-middle">
                    {row.docenteNombre}
                  </td>
                  <td className="px-2 py-1 align-middle">
                    {row.procedimientoPcl}
                  </td>
                  <td className="px-2 py-1 align-middle">
                    <EstadoBadge estado={row.estado} reabierto={row.reabierto} />
                  </td>
                  <td className="px-2 py-1 align-middle">
                    {row.totalTitulo1 ?? '-'}
                  </td>
                  <td className="px-2 py-1 align-middle">
                    {row.totalTitulo3 ?? '-'}
                  </td>
                  <td className="px-2 py-1 align-middle">
                    <button
                      type="button"
                      onClick={() => onOpenDictamen?.(row.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Ver / Editar
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
