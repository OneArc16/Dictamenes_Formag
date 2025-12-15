// src/hooks/useGuardarDeficienciaClase.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

type Payload = {
  dictamenId: number;
  deficienciaId: number;
  claseId: number;
  valorDeficiencia: number | null;
};

export function useGuardarDeficienciaClase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const res = await fetch(`/api/dictamenes/${payload.dictamenId}/deficiencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deficienciaId: payload.deficienciaId,
          claseId: payload.claseId,
          valorDeficiencia: payload.valorDeficiencia,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Error guardando deficiencia");
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      // ✅ refrescar panel inferior
      qc.invalidateQueries({ queryKey: ["dictamen-deficiencias-panel", variables.dictamenId] });
    },
  });
}
