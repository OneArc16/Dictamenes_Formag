"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useDeficienciasOpciones } from "@/hooks/useDeficienciasOpciones";
import { useGuardarDeficienciaClase } from "@/hooks/useGuardarDeficienciaClase";
import { useDeficienciaMovimientos } from "@/hooks/useDeficienciaMovimientos";

import { DeficienciaClaseSelector, ClaseSeleccion } from "./DeficienciaClaseSelector";
import { DeficienciaNervioSelector, NervioSeleccion } from "./DeficienciaNervioSelector";
import { DeficienciaFormulaInput } from "./DeficienciaFormulaInput";

type DiagnosticoItem = {
  id: number;
  cie10Codigo: string;
  tipo: string;
  cie10: { codigo: string; nombre: string };
  hasDeficiencia?: boolean;
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

function normalizeTipoTabla(tipo: string | null | undefined) {
  const t = (tipo ?? "").trim().toUpperCase();
  if (t === "CLASE" || t === "CLASES") return "CLASE";
  if (t === "NERVIO" || t === "NERVIOS") return "NERVIOS";
  if (t === "MOVIMIENTO" || t === "MOVIMIENTOS") return "MOVIMIENTO";
  if (t === "FORMULA" || t === "FORMULAS") return "FORMULA";
  return t || null;
}

export function AsignacionDeficienciaCard({
  dictamenId,
  diagnosticoSeleccionado,
  procedimientoPcl,
  onCancelar,
}: Props) {
  const qc = useQueryClient();
  const router = useRouter();

  const [deficienciaId, setDeficienciaId] = useState<number | null>(null);
  const [deficienciaSeleccionada, setDeficienciaSeleccionada] =
    useState<DeficienciaOpcion | null>(null);

  const [movModo, setMovModo] = useState<"RESTRICCION" | "ANQUILOSIS">("RESTRICCION");
  const [movSeleccion, setMovSeleccion] = useState<Record<string, number | null>>({});

  const [claseSeleccion, setClaseSeleccion] = useState<ClaseSeleccion>({
    claseId: null,
    valorDeficiencia: null,
  });

  const [nervioSeleccion, setNervioSeleccion] = useState<NervioSeleccion>({
    nervioId: null,
    tipo: "MIXTO",
    valorDeficiencia: null,
  });

  const [formulaValor, setFormulaValor] = useState<number | null>(null);

  useEffect(() => {
    setDeficienciaId(null);
    setDeficienciaSeleccionada(null);
    setClaseSeleccion({ claseId: null, valorDeficiencia: null });
    setNervioSeleccion({ nervioId: null, tipo: "MIXTO", valorDeficiencia: null });
    setFormulaValor(null);

    // ✅ reset MOVIMIENTO también
    setMovModo("RESTRICCION");
    setMovSeleccion({});
  }, [diagnosticoSeleccionado?.id]);

  const { data, isLoading, error } = useDeficienciasOpciones(
    dictamenId,
    diagnosticoSeleccionado ? diagnosticoSeleccionado.id : null
  );

  const opciones: DeficienciaOpcion[] = data?.opciones ?? [];

  const handleChangeDeficiencia = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;

    setDeficienciaId(id);
    setClaseSeleccion({ claseId: null, valorDeficiencia: null });
    setNervioSeleccion({ nervioId: null, tipo: "MIXTO", valorDeficiencia: null });
    setFormulaValor(null);

    // ✅ reset MOVIMIENTO al cambiar deficiencia
    setMovModo("RESTRICCION");
    setMovSeleccion({});

    if (!id) {
      setDeficienciaSeleccionada(null);
      return;
    }

    const found = opciones.find((o) => o.id === id) ?? null;
    setDeficienciaSeleccionada(found);
  };

  const tipoTabla = normalizeTipoTabla(deficienciaSeleccionada?.tipoTabla);

  // ✅ Query de movimientos (habilitado solo si es MOVIMIENTO)
  const movimientosQuery = useDeficienciaMovimientos(
    deficienciaSeleccionada?.id ?? null,
    !!deficienciaSeleccionada && tipoTabla === "MOVIMIENTO"
  );

  const guardarClase = useGuardarDeficienciaClase();

  const puedeGuardarClase =
    !!deficienciaId &&
    tipoTabla === "CLASE" &&
    !!claseSeleccion.claseId &&
    claseSeleccion.valorDeficiencia !== null;

  const puedeGuardarNervio =
    !!deficienciaId &&
    tipoTabla === "NERVIOS" &&
    !!nervioSeleccion.nervioId &&
    nervioSeleccion.valorDeficiencia !== null;

  const puedeGuardarFormula =
    !!deficienciaId &&
    tipoTabla === "FORMULA" &&
    formulaValor !== null;

  // ✅ MOVIMIENTO: guardado se habilita en el siguiente subpaso
  const puedeGuardarMovimiento = false;

  const isSaving = guardarClase.isPending;

  const guardarDisabled =
    (tipoTabla === "CLASE" && !puedeGuardarClase) ||
    (tipoTabla === "NERVIOS" && !puedeGuardarNervio) ||
    (tipoTabla === "FORMULA" && !puedeGuardarFormula) ||
    (tipoTabla === "MOVIMIENTO" && !puedeGuardarMovimiento) ||
    !tipoTabla ||
    isSaving;

  const invalidateAfterSave = async () => {
    await qc.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey;
        if (!Array.isArray(key)) return false;

        const hasDictamen = key.includes(dictamenId);
        const hasWords = key.some(
          (k) =>
            typeof k === "string" &&
            (k.includes("deficien") || k.includes("diagnost") || k.includes("panel") || k.includes("opcion"))
        );
        return hasDictamen && hasWords;
      },
      refetchType: "active",
    });
  };

  const handleGuardar = async () => {
    if (!deficienciaSeleccionada) return;

    try {
      if (tipoTabla === "CLASE") {
        if (!puedeGuardarClase || !claseSeleccion.claseId) return;

        await guardarClase.mutateAsync({
          dictamenId,
          deficienciaId: deficienciaSeleccionada.id,
          claseId: claseSeleccion.claseId,
          valorDeficiencia: claseSeleccion.valorDeficiencia,
        });

        toast.success("Deficiencia guardada");
        await invalidateAfterSave();
        router.refresh();
      } else if (tipoTabla === "NERVIOS") {
        if (!puedeGuardarNervio || !nervioSeleccion.nervioId) return;

        const res = await fetch(`/api/dictamenes/${dictamenId}/deficiencias`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deficienciaId: deficienciaSeleccionada.id,
            nervioId: nervioSeleccion.nervioId,
            valorDeficiencia: nervioSeleccion.valorDeficiencia,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.message ?? "Error guardando deficiencia (nervios)");

        toast.success("Deficiencia guardada");
        await invalidateAfterSave();
        router.refresh();
      } else if (tipoTabla === "FORMULA") {
        if (!puedeGuardarFormula) return;

        const res = await fetch(`/api/dictamenes/${dictamenId}/deficiencias`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deficienciaId: deficienciaSeleccionada.id,
            valorDeficiencia: formulaValor,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.message ?? "Error guardando deficiencia (fórmula)");

        toast.success("Deficiencia guardada");
        await invalidateAfterSave();
        router.refresh();
      } else if (tipoTabla === "MOVIMIENTO") {
        toast("MOVIMIENTO: guardado se habilita en el siguiente subpaso.");
        return;
      } else {
        toast.error(`Tipo ${tipoTabla} aún no implementado.`);
        return;
      }

      setDeficienciaId(null);
      setDeficienciaSeleccionada(null);
      setClaseSeleccion({ claseId: null, valorDeficiencia: null });
      setNervioSeleccion({ nervioId: null, tipo: "MIXTO", valorDeficiencia: null });
      setFormulaValor(null);

      // ✅ reset MOVIMIENTO también
      setMovModo("RESTRICCION");
      setMovSeleccion({});

      onCancelar();
    } catch (e: any) {
      toast.error(e.message ?? "Error guardando deficiencia");
    }
  };

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

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm h-fit">
      <h2 className="mb-3 text-lg font-semibold">Asignación de Deficiencia</h2>

      <div className="p-3 mb-4 bg-gray-100 rounded-md">
        <p className="font-medium">
          <span className="text-gray-700">Diagnóstico:</span>{" "}
          {diagnosticoSeleccionado.cie10.codigo} — {diagnosticoSeleccionado.cie10.nombre}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Procedimiento asignado al dictamen:{" "}
          <span className="font-semibold">{procedimientoPcl}</span>
        </p>
      </div>

      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deficiencia (según CIE10 del diagnóstico)
        </label>

        {isLoading && <p className="text-sm text-gray-600">Cargando…</p>}
        {error && <p className="text-sm text-red-600">Error cargando deficiencias disponibles.</p>}

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

      <div className="p-3 space-y-3 border rounded-md bg-gray-50">
        {!deficienciaSeleccionada && (
          <p className="text-sm text-gray-600">Seleccione una deficiencia para continuar.</p>
        )}

        {deficienciaSeleccionada && tipoTabla === "CLASE" && (
          <DeficienciaClaseSelector
            key={`${deficienciaSeleccionada.id}-${procedimientoPcl}`}
            deficienciaId={deficienciaSeleccionada.id}
            procedimientoPcl={procedimientoPcl}
            value={claseSeleccion}
            onChange={setClaseSeleccion}
          />
        )}

        {deficienciaSeleccionada && tipoTabla === "NERVIOS" && (
          <DeficienciaNervioSelector
            key={`${deficienciaSeleccionada.id}-${procedimientoPcl}`}
            deficienciaId={deficienciaSeleccionada.id}
            procedimientoPcl={procedimientoPcl}
            value={nervioSeleccion}
            onChange={setNervioSeleccion}
          />
        )}

        {deficienciaSeleccionada && tipoTabla === "FORMULA" && (
          <DeficienciaFormulaInput
            value={formulaValor}
            onChange={setFormulaValor}
            placeholder="Ej: 12.5"
          />
        )}

        {/* ✅ MOVIMIENTO (UI base) */}
        {deficienciaSeleccionada && tipoTabla === "MOVIMIENTO" && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Tipo de valoración
              </label>
              <select
                className="w-full px-2 text-sm bg-white border rounded-md h-9 border-slate-300"
                value={movModo}
                onChange={(e) => setMovModo(e.target.value as any)}
              >
                <option value="RESTRICCION">Restricción</option>
                <option value="ANQUILOSIS">Anquilosis</option>
              </select>
            </div>

            {movimientosQuery.isLoading && (
              <div className="p-3 text-sm border rounded-md bg-slate-50 text-slate-600">
                Cargando movimientos…
              </div>
            )}

            {movimientosQuery.isError && (
              <div className="p-3 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
                Error cargando movimientos de la deficiencia.
              </div>
            )}

            {!movimientosQuery.isLoading && !movimientosQuery.isError && (
              <>
                {(() => {
                  const movimientos = movimientosQuery.data ?? [];

                  const toNum = (v: any) => {
                    if (v === null || v === undefined) return null;
                    const s = String(v).trim();
                    if (!s) return null;
                    const n = Number(s.replace(",", "."));
                    return Number.isNaN(n) ? null : n;
                  };

                  const fmt = (v: any) => {
                    const n = toNum(v);
                    if (n === null) return "—";
                    return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
                  };

                  const getVal = (m: any) => {
                    if (movModo === "RESTRICCION") {
                      return procedimientoPcl === "A" ? toNum(m.restriccionA) : toNum(m.restriccionB);
                    }
                    return procedimientoPcl === "A" ? toNum(m.anquilosisA) : toNum(m.anquilosisB);
                  };

                  if (movimientos.length === 0) {
                    return (
                      <div className="p-3 text-sm border rounded-md bg-slate-50 text-slate-600">
                        Esta deficiencia no tiene movimientos configurados.
                      </div>
                    );
                  }

                  // ordenar globalmente por orden y luego agrupar por tipoMovimiento
                  const sorted = [...movimientos].sort(
                    (a: any, b: any) => (a.orden ?? 1) - (b.orden ?? 1) || a.id - b.id
                  );

                  const map = new Map<string, any[]>();
                  for (const m of sorted) {
                    const key = (m.tipoMovimiento || "SIN_TIPO").trim() || "SIN_TIPO";
                    if (!map.has(key)) map.set(key, []);
                    map.get(key)!.push(m);
                  }

                  const grupos = Array.from(map.entries()).map(([tipo, rows]) => ({ tipo, rows }));

                  return (
                    <div className="space-y-3">
                      {grupos.map((g) => (
                        <div key={g.tipo}>
                          <label className="block mb-1 text-sm font-medium text-slate-700">
                            {g.tipo}
                          </label>

                          <select
                            className="w-full px-2 text-sm bg-white border rounded-md h-9 border-slate-300"
                            value={movSeleccion[g.tipo] ?? ""}
                            onChange={(e) =>
                              setMovSeleccion((prev) => ({
                                ...prev,
                                [g.tipo]: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                          >
                            <option value="">Seleccione un rango…</option>

                            {g.rows.map((m: any) => {
                              const val = getVal(m);
                              const label = `${fmt(m.rangoInicial)}°–${fmt(m.rangoFinal)}° — ${
                                val === null ? "—" : `${fmt(val)}%`
                              }`;

                              return (
                                <option key={m.id} value={m.id}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      ))}

                      <p className="text-xs text-slate-500">
                        Guardado de MOVIMIENTO se habilita en el siguiente subpaso.
                      </p>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {deficienciaSeleccionada &&
          tipoTabla &&
          !["CLASE", "NERVIOS", "FORMULA", "MOVIMIENTO"].includes(tipoTabla) && (
            <p className="text-sm text-gray-600">
              Tipo <strong>{tipoTabla}</strong> aún no implementado en este paso.
            </p>
          )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancelar}
          className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>

        <button
          disabled={guardarDisabled}
          onClick={handleGuardar}
          className={`px-3 py-1 text-sm text-white rounded ${
            !guardarDisabled ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400 cursor-not-allowed"
          }`}
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

export default AsignacionDeficienciaCard;
