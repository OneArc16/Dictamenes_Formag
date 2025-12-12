// src/components/dictamen/deficiencias/DeficienciasAsignadasList.tsx
"use client";

import React from "react";

type DeficienciaAsignadaItem = {
  id: number;
  valorDeficiencia: number | null;
  creadoEn: string;

  deficiencia: {
    id: number;
    nombre: string;
    tabla: string;
    capitulo: string | null;
    tipoTabla: string | null;
  };

  clase: {
    id: number;
    nombre: string;
  } | null;
};

interface Props {
  items: DeficienciaAsignadaItem[];
}

export function DeficienciasAsignadasList({ items }: Props) {
  return (
    <div className="p-4 mt-4 bg-white border rounded-lg shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Deficiencias asignadas</h2>

      {items.length === 0 && (
        <p className="text-sm text-gray-600">
          Aún no hay deficiencias asignadas a este dictamen.
        </p>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="text-gray-700 bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left border">Tabla</th>
                <th className="px-2 py-1 text-left border">Deficiencia</th>
                <th className="px-2 py-1 text-left border">Clase</th>
                <th className="px-2 py-1 text-center border">Valor (%)</th>
                <th className="px-2 py-1 text-left border">Tipo Tabla</th>
                <th className="px-2 py-1 text-left border">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1 border">
                    {item.deficiencia.tabla}
                  </td>
                  <td className="px-2 py-1 border">
                    {item.deficiencia.nombre}
                  </td>
                  <td className="px-2 py-1 border">
                    {item.clase ? item.clase.nombre : "—"}
                  </td>
                  <td className="px-2 py-1 text-center border">
                    {item.valorDeficiencia ?? "—"}
                  </td>
                  <td className="px-2 py-1 border">
                    {item.deficiencia.tipoTabla}
                  </td>
                  <td className="px-2 py-1 border">
                    {new Date(item.creadoEn).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
