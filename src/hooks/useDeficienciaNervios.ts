// src/hooks/useDeficienciaNervios.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export function useDeficienciaNervios(deficienciaId: number | null) {
  return useQuery({
    queryKey: ["deficiencia-nervios", deficienciaId],
    queryFn: async () => {
      const res = await fetch(`/api/deficiencias/${deficienciaId}/nervios`);
      if (!res.ok) throw new Error("Error cargando nervios");
      return res.json();
    },
    enabled: !!deficienciaId,
    staleTime: 1000 * 60,
  });
}
