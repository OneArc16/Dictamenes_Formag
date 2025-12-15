// src/hooks/useDictamenDeficienciasPanel.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export interface DictamenPanelData {
  dictamen: {
    id: number;
    numeroDictamen: string | null;
    fechaDictamen: string | null;
    procedimientoPcl: "A" | "B";
  };
  diagnosticos: Array<{
    id: number;
    cie10Codigo: string;
    tipo: string;
    cie10: {
      codigo: string;
      nombre: string;
    };
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
    clase: {
      id: number;
      nombre: string;
    } | null;
  }>;
}

// ==============================
// 🔥 HOOK PRINCIPAL
// ==============================

export function useDictamenDeficienciasPanel(dictamenId: number) {
  return useQuery({
    queryKey: ["dictamen-deficiencias-panel", dictamenId],
    queryFn: async () => {
      const res = await fetch(`/api/dictamenes/${dictamenId}/deficiencias/panel`);
      if (!res.ok) throw new Error("Error cargando panel de deficiencias");
      return res.json();
    },
    staleTime: 1000 * 15,
  });
}
