"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

type ProcedimientoPcl = "A" | "B";

export function useActualizarProcedimientoDictamen(dictamenId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (procedimientoPcl: ProcedimientoPcl) => {
      const res = await fetch(`/api/dictamenes/${dictamenId}/procedimiento`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ procedimientoPcl }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message ?? "No se pudo actualizar el procedimiento");
      }
      return json;
    },

    onSuccess: async () => {
      // 🔁 Refrescar todo lo que dependa del dictamen/procedimiento
      await qc.invalidateQueries({
        predicate: (q) => {
          const key = q.queryKey;
          if (!Array.isArray(key)) return false;
          const hasDictamen = key.includes(dictamenId);
          const touchesPanel = key.some(
            (k) =>
              typeof k === "string" &&
              (k.includes("dictamen") ||
                k.includes("deficien") ||
                k.includes("diagnost") ||
                k.includes("panel") ||
                k.includes("opcion"))
          );
          return hasDictamen && touchesPanel;
        },
        refetchType: "active",
      });
    },
  });
}
