"use client";

import { useQuery } from "@tanstack/react-query";

export interface DictamenPanelData {
  dictamen: {
    id: number;
    numeroDictamen: string | null;
    fechaDictamen: string | null;
    procedimientoPcl: "A" | "B";
    totalTitulo1?: number | null;
  };
  diagnosticos: Array<{
    id: number;
    cie10Codigo: string;
    tipo: string;
    cie10: { codigo: string; nombre: string };
    hasDeficiencia?: boolean;
  }>;
  deficienciasAsignadas: Array<{
    id: number;
    valorDeficiencia: number | null;
    creadoEn: string;
    deficiencia: {
      id: number;
      nombre: string;
      tabla: string;
      capitulo: string | null;
      tipoTabla: string | null;
    };
    clase: { id: number; nombre: string } | null;
    nervio?: { id: number; nombre: string } | null;
  }>;
}

export function useDictamenDeficienciasPanel(
  dictamenId: number,
  procedimientoPcl?: "A" | "B" | null
) {
  const enabled = Number.isFinite(dictamenId);

  return useQuery<DictamenPanelData>({
    queryKey: ["dictamen-deficiencias-panel", dictamenId, procedimientoPcl ?? "NA"],
    enabled,
    queryFn: async () => {
      // ✅ guard extra: nunca fetch con id inválido
      if (!Number.isFinite(dictamenId)) {
        throw new Error("dictamenId inválido");
      }

      const res = await fetch(`/api/dictamenes/${dictamenId}/deficiencias/panel`, {
        cache: "no-store",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "Error cargando panel de deficiencias");
      return json as DictamenPanelData;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
}
