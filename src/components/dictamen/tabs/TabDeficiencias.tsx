"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDictamenDeficienciasPanel } from "@/hooks/useDictamenDeficienciasPanel";

import { DiagnosticosDeficienciaList } from "../deficiencias/DiagnosticosDeficienciaList";
import { AsignacionDeficienciaCard } from "../deficiencias/AsignacionDeficienciaCard";
import { DeficienciasAsignadasList } from "../deficiencias/DeficienciasAsignadasList";

interface Props {
  dictamenId: number;
  procedimientoPcl: "A" | "B";
}

type TotalesPcl = {
  totalTitulo1: number;
  totalCap2: number;
};

function toNum(v: any): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof v === "object" && typeof v?.toString === "function") {
    const n = Number(String(v.toString()));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function TabDeficiencias({ dictamenId, procedimientoPcl }: Props) {
  const queryClient = useQueryClient();

  // ✅ CLAVE: usa el mismo hook (y misma cache) que RightPanel/Cap2
  const { data, isLoading, error } = useDictamenDeficienciasPanel(
    dictamenId,
    procedimientoPcl
  );

  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<any>(null);

  // ✅ cache compartida para habilitar/deshabilitar tabs en CenterPanel
  const totalesKey = useMemo(
    () => ["dictamen", dictamenId, "totales"] as const,
    [dictamenId]
  );

  // ✅ Cada vez que llegue data del panel, sincroniza los totales al cache compartido
  useEffect(() => {
    const d: any = data;
    const serverT1 = toNum(d?.dictamen?.totalTitulo1);
    const serverC2 = toNum(d?.dictamen?.totalCap2);

    if (!d?.dictamen) return;

    queryClient.setQueryData<TotalesPcl>(totalesKey, (prev) => ({
      totalTitulo1: Number.isFinite(serverT1) ? serverT1 : prev?.totalTitulo1 ?? 0,
      totalCap2: Number.isFinite(serverC2) ? serverC2 : prev?.totalCap2 ?? 0,
    }));
  }, [
    // dependencias finas (evitan rerenders raros)
    (data as any)?.dictamen?.totalTitulo1,
    (data as any)?.dictamen?.totalCap2,
    queryClient,
    totalesKey,
    data,
  ]);

  if (isLoading) return <p className="text-sm text-gray-600">Cargando información...</p>;

  if (error || !data) {
    return <p className="text-sm text-red-600">Error cargando el panel de deficiencias.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DiagnosticosDeficienciaList
          diagnosticos={(data as any).diagnosticos}
          onAsignar={(diag) => setDiagnosticoSeleccionado(diag)}
        />

        <AsignacionDeficienciaCard
          dictamenId={dictamenId}
          diagnosticoSeleccionado={diagnosticoSeleccionado}
          procedimientoPcl={procedimientoPcl}
          onCancelar={() => setDiagnosticoSeleccionado(null)}
        />
      </div>

      <DeficienciasAsignadasList
        dictamenId={dictamenId}
        items={(data as any).deficienciasAsignadas}
      />
    </div>
  );
}

export default TabDeficiencias;