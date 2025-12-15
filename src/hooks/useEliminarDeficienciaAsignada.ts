// src/hooks/useEliminarDeficienciaAsignada.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useEliminarDeficienciaAsignada() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { dictamenId: number; dictamenDeficienciaId: number }) => {
      const res = await fetch(
        `/api/dictamenes/${payload.dictamenId}/deficiencias/${payload.dictamenDeficienciaId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Error eliminando deficiencia");
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      // refresca diagnósticos (borde verde) + tabla inferior + todo el panel
      qc.invalidateQueries({ queryKey: ["dictamen-deficiencias-panel", variables.dictamenId] });
    },
  });
}
