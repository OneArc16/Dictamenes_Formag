"use client";

import React, { useMemo } from "react";
import { useDeficienciaNervios } from "@/hooks/useDeficienciaNervios";

export type NervioSeleccion = {
  nervioId: number | null;
  tipo: "MOTOR" | "SENSITIVO" | "MIXTO";
  valorDeficiencia: number | null;
};

type NervioRow = {
  id: number;
  nombre: string;
  orden: number;
  motorA: string | number | null;
  sensitivoA: string | number | null;
  mixtoA: string | number | null;
  motorB: string | number | null;
  sensitivoB: string | number | null;
  mixtoB: string | number | null;
};

function toNum(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isNaN(n) ? null : n;
}

export function DeficienciaNervioSelector({
  deficienciaId,
  procedimientoPcl,
  value,
  onChange,
}: {
  deficienciaId: number;
  procedimientoPcl: "A" | "B";
  value: NervioSeleccion;
  onChange: (v: NervioSeleccion) => void;
}) {
  const { data, isLoading, error } = useDeficienciaNervios(deficienciaId);

  const nervios: NervioRow[] = data?.nervios ?? [];

  const selectedRow = useMemo(() => {
    return nervios.find((n) => n.id === value.nervioId) ?? null;
  }, [nervios, value.nervioId]);

  const calcValor = (row: NervioRow | null, tipo: NervioSeleccion["tipo"]) => {
    if (!row) return null;
    if (procedimientoPcl === "A") {
      if (tipo === "MOTOR") return toNum(row.motorA);
      if (tipo === "SENSITIVO") return toNum(row.sensitivoA);
      return toNum(row.mixtoA);
    } else {
      if (tipo === "MOTOR") return toNum(row.motorB);
      if (tipo === "SENSITIVO") return toNum(row.sensitivoB);
      return toNum(row.mixtoB);
    }
  };

  const handleNervioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nervioId = e.target.value ? Number(e.target.value) : null;
    const row = nervios.find((n) => n.id === nervioId) ?? null;

    const valor = calcValor(row, value.tipo);

    onChange({
      ...value,
      nervioId,
      valorDeficiencia: valor,
    });
  };

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value as NervioSeleccion["tipo"];
    const valor = calcValor(selectedRow, tipo);

    onChange({
      ...value,
      tipo,
      valorDeficiencia: valor,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nervio (ordenado por tabla)
        </label>

        {isLoading && <p className="mt-1 text-sm text-gray-600">Cargando nervios…</p>}
        {error && <p className="mt-1 text-sm text-red-600">Error cargando nervios.</p>}

        {!isLoading && !error && (
          <select
            className="w-full px-2 py-1 mt-1 text-sm border rounded-md"
            value={value.nervioId ?? ""}
            onChange={handleNervioChange}
          >
            <option value="">Seleccione un nervio…</option>
            {nervios.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo (motor / sensitivo / mixto)
          </label>
          <select
            className="w-full px-2 py-1 mt-1 text-sm border rounded-md"
            value={value.tipo}
            onChange={handleTipoChange}
            disabled={!value.nervioId}
          >
            <option value="MOTOR">Motor</option>
            <option value="SENSITIVO">Sensitivo</option>
            <option value="MIXTO">Mixto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor (según procedimiento {procedimientoPcl})
          </label>
          <input
            className="w-full px-2 py-1 mt-1 text-sm border rounded-md bg-gray-50"
            value={value.valorDeficiencia ?? ""}
            readOnly
            placeholder="—"
          />
        </div>
      </div>
    </div>
  );
}

export default DeficienciaNervioSelector;
