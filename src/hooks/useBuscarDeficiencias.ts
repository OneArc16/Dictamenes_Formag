"use client";

import { useQuery } from "@tanstack/react-query";

export type DeficienciaBuscarItem = {
  id: number;
  nombre: string;
  tabla: string;
  capitulo: string | null;
  tipoTabla: string | null;
};

async function fetchBuscarDeficiencias(q: string): Promise<DeficienciaBuscarItem[]> {
  const res = await fetch(`/api/deficiencias/buscar?q=${encodeURIComponent(q)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message ?? "Error buscando deficiencias");
  return (json?.items ?? []) as DeficienciaBuscarItem[];
}

export function useBuscarDeficiencias(q: string) {
  const term = (q ?? "").trim();

  return useQuery({
    queryKey: ["deficiencias", "buscar", term],
    queryFn: () => fetchBuscarDeficiencias(term),
    enabled: term.length >= 2,
    staleTime: 30_000,
  });
}
