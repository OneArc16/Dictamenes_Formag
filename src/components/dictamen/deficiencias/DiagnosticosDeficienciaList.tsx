// src/components/dictamen/deficiencias/DiagnosticosDeficienciaList.tsx
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
};

interface Props {
  diagnosticos: DiagnosticoItem[];
  onAsignar: (diagnostico: DiagnosticoItem) => void;
}

export function DiagnosticosDeficienciaList({ diagnosticos, onAsignar }: Props) {
  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Diagnósticos del Dictamen</h2>

      {diagnosticos.length === 0 && (
        <p className="text-sm text-gray-600">No hay diagnósticos registrados.</p>
      )}

      <div className="space-y-3">
        {diagnosticos.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between p-3 transition border rounded-md bg-gray-50 hover:bg-gray-100"
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
        ))}
      </div>
    </div>
  );
}
