// src/components/dictamen/deficiencias/DeficienciaClaseSelector.tsx
"use client";

import React from "react";
import { useDeficienciaClases } from "@/hooks/useDeficienciaClases";

export interface ClaseSeleccion {
  claseId: number | null;
  valorDeficiencia: number | null;
}

interface Props {
  deficienciaId: number | null;
  procedimientoPcl: "A" | "B";
  value: ClaseSeleccion;
  onChange: (value: ClaseSeleccion) => void;
}

export function DeficienciaClaseSelector({
  deficienciaId,
  procedimientoPcl,
  value,
  onChange,
}: Props) {
  const { data, isLoading, error } = useDeficienciaClases(deficienciaId);

  const clases = data?.clases ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;

    if (!id) {
      onChange({ claseId: null, valorDeficiencia: null });
      return;
    }

    const clase = clases.find((c) => c.id === id);
    if (!clase) {
      onChange({ claseId: null, valorDeficiencia: null });
      return;
    }

    // Elegimos el valor según el procedimiento del dictamen
    const valor =
      procedimientoPcl === "A"
        ? clase.procedimientoA ?? null
        : clase.procedimientoB ?? null;

    onChange({
      claseId: clase.id,
      valorDeficiencia: valor,
    });
  };

  if (!deficienciaId) {
    return (
      <p className="text-sm text-gray-600">
        Primero seleccione una deficiencia.
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-gray-600">Cargando clases...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Error cargando las clases de la deficiencia.
      </p>
    );
  }

  if (clases.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Esta deficiencia no tiene clases configuradas.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Clase de la deficiencia
      </label>

      <select
        className="w-full px-2 py-1 text-sm border rounded-md"
        value={value.claseId ?? ""}
        onChange={handleChange}
      >
        <option value="">Seleccione una clase…</option>
        {clases.map((clase) => {
          const valor =
            procedimientoPcl === "A"
              ? clase.procedimientoA
              : clase.procedimientoB;

          const valorTexto =
            valor !== null && valor !== undefined ? `${valor}%` : "—";

          return (
            <option key={clase.id} value={clase.id}>
              {clase.nombre} — {valorTexto}
            </option>
          );
        })}
      </select>

      {value.valorDeficiencia !== null && (
        <p className="text-xs text-gray-600">
          Valor seleccionado:{" "}
          <span className="font-semibold">{value.valorDeficiencia}%</span>
        </p>
      )}
    </div>
  );
}
