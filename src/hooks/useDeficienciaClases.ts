// src/hooks/useDeficienciaClases.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export interface DeficienciaClaseItem {
  id: number;
  nombre: string;
  procedimientoA: number | null;
  procedimientoB: number | null;
  orden: number;
}

interface ClasesResponse {
  clases: DeficienciaClaseItem[];
}

/**
 * Hook para obtener las clases de una deficiencia (tipo_tabla = CLASE)
 */
export function useDeficienciaClases(deficienciaId: number | null) {
  return useQuery<ClasesResponse>({
    queryKey: ["deficiencia-clases", deficienciaId],
    queryFn: async () => {
      if (!deficienciaId) {
        throw new Error("deficienciaId requerido");
      }

      const res = await fetch(`/api/deficiencias/${deficienciaId}/clases`);

      if (!res.ok) {
        throw new Error("Error cargando clases de la deficiencia");
      }

      return res.json();
    },
    enabled: Boolean(deficienciaId),
    staleTime: 1000 * 30,
  });
}
