// src/hooks/useDictamenDeficienciasPanel.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export interface DictamenPanelData {
  dictamen: {
    id: number;
    numeroDictamen: string | null;
    fechaDictamen: string | null;
    procedimientoPcl: "A" | "B";
    totalTitulo1?: number | null; // opcional por compatibilidad si ya lo estás devolviendo
  };
  diagnosticos: Array<{
    id: number;
    cie10Codigo: string;
    tipo: string;
    cie10: {
      codigo: string;
      nombre: string;
    };
    hasDeficiencia?: boolean; // opcional por compatibilidad
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
    nervio?: { id: number; nombre: string } | null; // opcional por compatibilidad
  }>;
}

// ==============================
// 🔥 HOOK PRINCIPAL
// ==============================

export function useDictamenDeficienciasPanel(
  dictamenId: number,
  procedimientoPcl?: "A" | "B" | null
) {
  return useQuery<DictamenPanelData>({
    // ✅ clave incluye el procedimiento para evitar cache “pegado”
    queryKey: ["dictamen-deficiencias-panel", dictamenId, procedimientoPcl ?? "NA"],
    enabled: Number.isFinite(dictamenId),
    queryFn: async () => {
      const res = await fetch(`/api/dictamenes/${dictamenId}/deficiencias/panel`, {
        cache: "no-store",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message ?? "Error cargando panel de deficiencias");
      }
      return json as DictamenPanelData;
    },
    // ✅ mejor para reflejar cambios inmediatos
    staleTime: 0,
    refetchOnMount: "always",
  });
}
