// src/components/dictamen/deficiencias/AsignacionDeficienciaCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useDeficienciasOpciones } from "@/hooks/useDeficienciasOpciones";
import {
  DeficienciaClaseSelector,
  ClaseSeleccion,
} from "./DeficienciaClaseSelector";

type DiagnosticoItem = {
  id: number;
  cie10Codigo: string;
  tipo: string;
  cie10: {
    codigo: string;
    nombre: string;
  };
};

type DeficienciaOpcion = {
  id: number;
  nombre: string;
  tabla: string;
  capitulo: string | null;
  tipoTabla: string | null;
};

interface Props {
  dictamenId: number;
  diagnosticoSeleccionado: DiagnosticoItem | null;
  procedimientoPcl: "A" | "B";
  onCancelar: () => void;
}

export function AsignacionDeficienciaCard({
  dictamenId,
  diagnosticoSeleccionado,
  procedimientoPcl,
  onCancelar,
}: Props) {
  // Estado: deficiencia seleccionada
  const [deficienciaId, setDeficienciaId] = useState<number | null>(null);
  const [deficienciaSeleccionada, setDeficienciaSeleccionada] =
    useState<DeficienciaOpcion | null>(null);

  // Estado: selección de clase (solo para tipo_tabla = CLASE)
  const [claseSeleccion, setClaseSeleccion] = useState<ClaseSeleccion>({
    claseId: null,
    valorDeficiencia: null,
  });

  // Cuando cambia el diagnóstico, limpiamos la selección de deficiencia y clase
  useEffect(() => {
    setDeficienciaId(null);
    setDeficienciaSeleccionada(null);
    setClaseSeleccion({ claseId: null, valorDeficiencia: null });
  }, [diagnosticoSeleccionado?.id]);

  // Cargamos las opciones de deficiencia según el diagnóstico
  const { data, isLoading, error } = useDeficienciasOpciones(
    dictamenId,
    diagnosticoSeleccionado ? diagnosticoSeleccionado.id : null
  );

  const opciones: DeficienciaOpcion[] = data?.opciones ?? [];

  const handleChangeDeficiencia = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value ? Number(e.target.value) : null;

    setDeficienciaId(id);
    setClaseSeleccion({ claseId: null, valorDeficiencia: null });

    if (!id) {
      setDeficienciaSeleccionada(null);
      return;
    }

    const found = opciones.find((o) => o.id === id) ?? null;
    setDeficienciaSeleccionada(found);
  };

  const tipoTabla =
    deficienciaSeleccionada?.tipoTabla?.toUpperCase() ?? null;

  const puedeGuardar =
    !!deficienciaId &&
    tipoTabla === "CLASE" &&
    !!claseSeleccion.claseId &&
    claseSeleccion.valorDeficiencia !== null;

  // ================= SIN DIAGNÓSTICO =================
  if (!diagnosticoSeleccionado) {
    return (
      <div className="p-4 bg-white border rounded-lg shadow-sm h-fit">
        <h2 className="mb-3 text-lg font-semibold">Asignación de Deficiencia</h2>
        <p className="text-sm text-gray-600">
          Seleccione un diagnóstico de la lista para asignar una deficiencia.
        </p>
      </div>
    );
  }

  // ================= UI PRINCIPAL ====================
  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm h-fit">
      {/* Título */}
      <h2 className="mb-3 text-lg font-semibold">Asignación de Deficiencia</h2>

      {/* Resumen del diagnóstico */}
      <div className="p-3 mb-4 bg-gray-100 rounded-md">
        <p className="font-medium">
          <span className="text-gray-700">Diagnóstico:</span>{" "}
          {diagnosticoSeleccionado.cie10.codigo} —{" "}
          {diagnosticoSeleccionado.cie10.nombre}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Procedimiento asignado al dictamen:{" "}
          <span className="font-semibold">{procedimientoPcl}</span>
        </p>
      </div>

      {/* SELECT de deficiencia */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deficiencia (según CIE10 del diagnóstico)
        </label>

        {isLoading && (
          <p className="text-sm text-gray-600">Cargando deficiencias…</p>
        )}

        {error && (
          <p className="text-sm text-red-600">
            Error cargando las deficiencias disponibles.
          </p>
        )}

        {!isLoading && !error && (
          <select
            className="w-full px-2 py-1 text-sm border rounded-md"
            value={deficienciaId ?? ""}
            onChange={handleChangeDeficiencia}
          >
            <option value="">Seleccione una deficiencia…</option>
            {opciones.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.tabla ? `[${opt.tabla}] ` : ""}
                {opt.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* CONTENIDO DINÁMICO SEGÚN TIPO_TABLA */}
      <div className="p-3 space-y-3 border rounded-md bg-gray-50">
        {!deficienciaSeleccionada && (
          <p className="text-sm text-gray-600">
            Seleccione una deficiencia para continuar.
          </p>
        )}

        {deficienciaSeleccionada && tipoTabla === "CLASE" && (
          <DeficienciaClaseSelector
            deficienciaId={deficienciaSeleccionada.id}
            procedimientoPcl={procedimientoPcl}
            value={claseSeleccion}
            onChange={setClaseSeleccion}
          />
        )}

        {deficienciaSeleccionada &&
          tipoTabla &&
          tipoTabla !== "CLASE" && (
            <p className="text-sm text-gray-600">
              Esta deficiencia es de tipo <strong>{tipoTabla}</strong>. El
              manejo para este tipo aún no está implementado en esta etapa.
            </p>
          )}
      </div>

      {/* RESUMEN DE LO SELECCIONADO */}
      {deficienciaSeleccionada && (
        <div className="p-3 mt-3 text-sm border border-blue-100 rounded-md bg-blue-50">
          <p className="mb-1 font-medium text-blue-800">
            Resumen de la selección
          </p>
          <p className="text-blue-800">
            Deficiencia:{" "}
            <span className="font-semibold">
              {deficienciaSeleccionada.nombre}
            </span>
          </p>
          {tipoTabla === "CLASE" && claseSeleccion.claseId && (
            <p className="text-blue-800">
              Clase seleccionada:{" "}
              <span className="font-semibold">
                {claseSeleccion.valorDeficiencia ?? "—"}%
              </span>
            </p>
          )}
        </div>
      )}

      {/* Botones inferiores */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancelar}
          className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>

        <button
          disabled={!puedeGuardar}
          className={`px-3 py-1 text-sm text-white rounded ${
            puedeGuardar
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-400 cursor-not-allowed"
          }`}
        >
          Guardar (aún sin persistencia)
        </button>
      </div>
    </div>
  );
}
