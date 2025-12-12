// src/hooks/useDeficienciasOpciones.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export interface DeficienciaOpcion {
  id: number;
  nombre: string;
  tabla: string;
  capitulo: string | null;
  tipoTabla: string | null;
}

export interface DeficienciasOpcionesResponse {
  cie10: {
    codigo: string;
    nombre: string;
  };
  opciones: DeficienciaOpcion[];
}

/**
 * Hook para obtener las deficiencias disponibles para un diagnóstico
 * de un dictamen (según CIE10 y tabla cie10_deficiencias).
 */
export function useDeficienciasOpciones(
  dictamenId: number,
  diagnosticoId: number | null
) {
  return useQuery<DeficienciasOpcionesResponse>({
    queryKey: ["deficiencias-opciones", dictamenId, diagnosticoId],
    queryFn: async () => {
      if (!diagnosticoId) {
        throw new Error("diagnosticoId requerido");
      }

      const res = await fetch(
        `/api/dictamenes/${dictamenId}/diagnosticos/${diagnosticoId}/deficiencias-opciones`
      );

      if (!res.ok) {
        throw new Error("Error cargando deficiencias para el diagnóstico");
      }

      return res.json();
    },
    enabled: Boolean(diagnosticoId), // solo se ejecuta si hay diagnóstico seleccionado
    staleTime: 1000 * 30, // 30 segundos
  });
}
