"use client";

import React, { useState } from "react";
import { useDictamenDeficienciasPanel } from "@/hooks/useDictamenDeficienciasPanel";

import { DiagnosticosDeficienciaList } from "../deficiencias/DiagnosticosDeficienciaList";
import { AsignacionDeficienciaCard } from "../deficiencias/AsignacionDeficienciaCard";
import { DeficienciasAsignadasList } from "../deficiencias/DeficienciasAsignadasList";

interface Props {
  dictamenId: number;
  procedimientoPcl: "A" | "B";
}

export function TabDeficiencias({ dictamenId, procedimientoPcl }: Props) {
  const { data, isLoading, error } = useDictamenDeficienciasPanel(dictamenId);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<any>(null);

  if (isLoading) return <p className="text-sm text-gray-600">Cargando información...</p>;

  if (error || !data) {
    return <p className="text-sm text-red-600">Error cargando el panel de deficiencias.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DiagnosticosDeficienciaList
          diagnosticos={data.diagnosticos}
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
        items={data.deficienciasAsignadas}
      />
    </div>
  );
}

export default TabDeficiencias;
