"use client";

import { useQuery } from "@tanstack/react-query";

export type DeficienciaMovimientoDto = {
  id: number;
  deficienciaId: number;
  tipoMovimiento: string;
  rangoInicial: any;
  rangoFinal: any;
  restriccionA: any;
  restriccionB: any;
  anquilosisA: any;
  anquilosisB: any;
  grupo: string | null;
  orden: number;
};

export function useDeficienciaMovimientos(deficienciaId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["deficiencias", "movimientos", deficienciaId],
    enabled: enabled && !!deficienciaId,
    queryFn: async (): Promise<DeficienciaMovimientoDto[]> => {
      const res = await fetch(`/api/deficiencias/${deficienciaId}/movimientos`);
      if (!res.ok) {
        let msg = "No se pudieron cargar los movimientos.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      return data?.movimientos ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
