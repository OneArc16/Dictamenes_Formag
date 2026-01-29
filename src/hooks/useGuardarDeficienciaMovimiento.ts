"use client";

import { useMutation } from "@tanstack/react-query";

type MovimientoModo = "RESTRICCION" | "ANQUILOSIS";

type GuardarMovimientoPayload = {
  dictamenId: number;
  deficienciaId: number;
  modo: MovimientoModo;
  valorDeficiencia: number; // ✅ libre
  items: Array<{
    tipoMovimiento: string;
    movimientoId: number;
  }>;
};

export function useGuardarDeficienciaMovimiento() {
  return useMutation({
    mutationFn: async (payload: GuardarMovimientoPayload) => {
      const res = await fetch(
        `/api/dictamenes/${payload.dictamenId}/deficiencias/movimientos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deficienciaId: payload.deficienciaId,
            modo: payload.modo,
            valorDeficiencia: payload.valorDeficiencia,
            items: payload.items,
          }),
        }
      );

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        throw new Error(json?.message ?? "Error guardando deficiencia (movimientos)");
      }

      return json;
    },
  });
}
