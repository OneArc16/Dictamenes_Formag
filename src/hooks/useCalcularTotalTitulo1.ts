"use client";

import { useMutation } from "@tanstack/react-query";

type Resp = {
  message: string;
  dictamen: {
    id: number;
    procedimientoPcl: "A" | "B";
    totalTitulo1: number | null;
  };
  valoresUsados?: number[];
};

export function useCalcularTotalTitulo1() {
  return useMutation({
    mutationFn: async ({ dictamenId }: { dictamenId: number }) => {
      const res = await fetch(
        `/api/dictamenes/${dictamenId}/total-titulo-1/calcular`,
        { method: "POST" }
      );

      const json = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(json?.message ?? "Error calculando total título 1");
      }
      return json as Resp;
    },
  });
}
