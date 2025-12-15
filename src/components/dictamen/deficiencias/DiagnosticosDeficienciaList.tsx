"use client";

import React from "react";

type DiagnosticoItem = {
  id: number;
  cie10Codigo: string;
  tipo: string;
  cie10: {
    codigo: string;
    nombre: string;
  };
  hasDeficiencia?: boolean; // ✅ viene del panel
};

export function DiagnosticosDeficienciaList({
  diagnosticos,
  onAsignar,
}: {
  diagnosticos: DiagnosticoItem[];
  onAsignar: (diag: DiagnosticoItem) => void;
}) {
  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Diagnósticos del Dictamen</h2>

      {(!diagnosticos || diagnosticos.length === 0) && (
        <p className="text-sm text-gray-600">
          No hay diagnósticos asociados a este dictamen.
        </p>
      )}

      <div className="space-y-3">
        {diagnosticos?.map((d) => {
          const borde = d.hasDeficiencia
            ? "border-green-500"
            : "border-gray-200";

          const fondo = d.hasDeficiencia ? "bg-green-50" : "bg-white";

          return (
            <div
              key={d.id}
              className={`border ${borde} ${fondo} rounded-md p-3 flex items-center justify-between`}
            >
            <div>
              <p className="font-medium text-gray-800">
                {d.cie10.codigo} — {d.cie10.nombre}
              </p>
              <p className="text-xs text-gray-500">
                Tipo: {d.tipo.replaceAll("_", " ")}
              </p>
            </div>

              <button
                onClick={() => onAsignar(d)}
                className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Asignar deficiencia
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DiagnosticosDeficienciaList;
