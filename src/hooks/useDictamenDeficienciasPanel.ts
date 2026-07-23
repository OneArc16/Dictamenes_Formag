"use client";

import { useQuery } from "@tanstack/react-query";

export interface DictamenPanelData {
  ok?: boolean;
  dictamen: {
    id: number;
    numeroDictamen: string | null;
    fechaDictamen: string | null;
    procedimientoPcl: "A" | "B";
    estado?: string;

    totalTitulo1?: number | null;
    totalCap1?: number | null;

    // ✅ Cap 2 (Limitación laboral)
    totalCap2?: number | null;
    claseLimitacionLaboral?: string | null;

    // ✅ NUEVO: Título III (Análisis ocupacional)
    totalTitulo3?: number | null;
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

function toNumber(v: any): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  // por si llega Decimal/string o "35%"
  const s = String(v).trim().replace("%", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function useDictamenDeficienciasPanel(
  dictamenId: number,
  procedimientoPcl?: "A" | "B" | null
) {
  const enabled = Number.isFinite(dictamenId) && dictamenId > 0;

  return useQuery<DictamenPanelData>({
    queryKey: ["dictamen-deficiencias-panel", dictamenId, procedimientoPcl ?? "NA"],
    enabled,
    queryFn: async () => {
      if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
        throw new Error("dictamenId inválido");
      }

      const res = await fetch(`/api/dictamenes/${dictamenId}/deficiencias/panel`, {
        cache: "no-store",
        credentials: "include",
      });

      const contentType = res.headers.get("content-type") || "";
      const json = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null);

      if (!res.ok) {
        const msg =
          (json && typeof json === "object" && (json.error || json.message)) ||
          "Error cargando panel de deficiencias";
        throw new Error(msg);
      }

      // si viene { ok:false } también lo tratamos como error
      if (json && typeof json === "object" && json.ok === false) {
        throw new Error(json.error ?? json.message ?? "Error cargando panel de deficiencias");
      }

      const data = json as DictamenPanelData;

      // ✅ normalizar números (por si Prisma devuelve Decimal/string)
      if (data?.dictamen) {
        data.dictamen.totalTitulo1 = toNumber(data.dictamen.totalTitulo1);
        data.dictamen.totalCap1 = toNumber(data.dictamen.totalCap1);
        data.dictamen.totalCap2 = toNumber(data.dictamen.totalCap2);

        // ✅ NUEVO
        data.dictamen.totalTitulo3 = toNumber((data.dictamen as any).totalTitulo3);
      }

      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
}
