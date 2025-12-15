// src/components/dictamen/deficiencias/DeficienciaClaseSelector.tsx
"use client";

import React, { useEffect } from "react";
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

  // 🔁 RECALCULAR CUANDO CAMBIA EL PROCEDIMIENTO
  useEffect(() => {
    if (!value.claseId) return;

    const clase = clases.find((c) => c.id === value.claseId);
    if (!clase) return;

    const nuevoValor =
      procedimientoPcl === "A"
        ? clase.procedimientoA ?? null
        : clase.procedimientoB ?? null;

    onChange({
      claseId: clase.id,
      valorDeficiencia: nuevoValor,
    });
  }, [procedimientoPcl, value.claseId, clases, onChange]);

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
    return <p className="text-sm text-gray-600">Seleccione una deficiencia.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-gray-600">Cargando clases…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Error cargando las clases de la deficiencia.
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

          return (
            <option key={clase.id} value={clase.id}>
              {clase.nombre} — {valor ?? "—"}%
            </option>
          );
        })}
      </select>

      {value.valorDeficiencia !== null && (
        <p className="text-xs text-gray-600">
          Valor aplicado ({procedimientoPcl}):{" "}
          <strong>{value.valorDeficiencia}%</strong>
        </p>
      )}
    </div>
  );
}
