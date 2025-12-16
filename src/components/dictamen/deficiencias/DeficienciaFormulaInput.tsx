"use client";

import React from "react";

type Props = {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
};

export function DeficienciaFormulaInput({ value, onChange, placeholder }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Valor (se aplicará fórmula después)</label>
      <input
        type="number"
        inputMode="decimal"
        className="w-full px-2 py-1 text-sm bg-white border rounded-md"
        value={value ?? ""}
        placeholder={placeholder ?? "Ingrese un valor…"}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          const n = Number(raw);
          onChange(Number.isFinite(n) ? n : null);
        }}
      />
      <p className="text-xs text-gray-500">
        Por ahora solo guardamos el valor. Luego aplicamos la fórmula que nos indiques.
      </p>
    </div>
  );
}

export default DeficienciaFormulaInput;
