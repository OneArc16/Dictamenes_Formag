"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

type ProcedimientoPcl = "A" | "B";

type Props = {
  dictamenId: number;
  procedimientoPcl: ProcedimientoPcl;
};

// Lista en el mismo orden del enum (strings exactos del enum Prisma)
const ACTIVIDADES = [
  { key: "MIRAR", label: "Mirar" },
  { key: "ESCUCHAR", label: "Escuchar" },
  { key: "PENSAR", label: "Pensar" },
  { key: "LEER", label: "Leer" },
  { key: "ESCRIBIR", label: "Escribir" },
  { key: "COMUNICARSE_CON_MENSAJES_ESCRITOS", label: "Comunicarse con recepción de mensajes escritos" },
  { key: "HABLA", label: "Habla" },
  { key: "PRODUCCION_MENSAJES_NO_VERBALES", label: "Producción de mensajes no verbales" },
  { key: "MENSAJES_ESCRITOS", label: "Mensajes escritos" },
  { key: "CONVERSACION", label: "Conversación" },
  { key: "MANTENER_CAMBIAR_POSICION_CUERPO", label: "Mantener y cambiar la posición del cuerpo y posturas corporales" },
  { key: "USO_MANO_BRAZO", label: "Uso de la mano y brazo" },
  { key: "DESPLAZARSE_ENTORNO", label: "Desplazarse en el entorno" },
  { key: "USO_TRANSPORTE_PASAJERO", label: "Utilización de transporte como pasajero" },
  { key: "CONDUCCION", label: "Conducción" },
  { key: "LAVARSE", label: "Lavarse" },
  { key: "CUIDADO_PARTES_CUERPO", label: "Cuidado de partes del cuerpo" },
  { key: "VESTIRSE", label: "Vestirse" },
  { key: "COMER", label: "Comer" },
  { key: "BEBER", label: "Beber" },
  { key: "ADQUIRIR_LO_NECESARIO_PARA_VIVIR", label: "Adquirir lo necesario para vivir" },
  { key: "ADQUIRIR_BIENES_SERVICIOS", label: "Adquirir bienes y servicios" },
  { key: "PREPARAR_COMIDAS", label: "Preparar comidas" },
  { key: "QUEHACERES_CASA", label: "Quehaceres de la casa" },
  { key: "AYUDAR_A_LOS_DEMAS", label: "Ayudar a los demás" },
] as const;

type ActividadKey = (typeof ACTIVIDADES)[number]["key"];
type Valor = "0.6" | "0.3" | "0.0";

const OPCIONES: Array<{ value: Valor; label: string }> = [
  { value: "0.6", label: "0.6 — Mayor limitación" },
  { value: "0.3", label: "0.3 — Limitación parcial" },
  { value: "0.0", label: "0.0 — Sin limitación" },
];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

type SaveUiState = "idle" | "saving" | "saved";

export default function TabAvdAivd({ dictamenId, procedimientoPcl }: Props) {
  const blocked = procedimientoPcl === "A";
  const queryClient = useQueryClient(); // ✅ NUEVO

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [savingKey, setSavingKey] = useState<ActividadKey | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [calcBusy, setCalcBusy] = useState(false);

  const [values, setValues] = useState<Partial<Record<ActividadKey, Valor>>>({});
  const [totalCap1, setTotalCap1] = useState<string | null>(null);

  // Indicador discreto "Guardando / Guardado"
  const [saveUi, setSaveUi] = useState<SaveUiState>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ACTIVIDADES;
    return ACTIVIDADES.filter((a) => a.label.toLowerCase().includes(term));
  }, [q]);

  const doneCount = useMemo(() => Object.values(values).filter(Boolean).length, [values]);

  function setSavingUi() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveUi("saving");
  }

  function setSavedUi() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveUi("saved");
    saveTimerRef.current = setTimeout(() => setSaveUi("idle"), 1200);
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      // Si es A, no aplica: no cargamos nada
      if (blocked) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/dictamenes/${dictamenId}/avd-aivd`, { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "No se pudo cargar AVD-AIVD");

        const map: Partial<Record<ActividadKey, Valor>> = {};
        for (const it of data.items ?? []) {
          map[it.actividad as ActividadKey] = it.valor as Valor;
        }

        if (mounted) setValues(map);
      } catch (e: any) {
        toast.error(e?.message ?? "Error cargando AVD-AIVD");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [dictamenId, blocked]);

  async function saveOne(actividad: ActividadKey, valor: Valor) {
    if (blocked) return;

    setSavingUi();
    setSavingKey(actividad);

    try {
      const res = await fetch(`/api/dictamenes/${dictamenId}/avd-aivd`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actividad, valor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo guardar");

      setSavedUi();
    } catch (e: any) {
      setSaveUi("idle");
      toast.error(e?.message ?? "Error guardando");
    } finally {
      setSavingKey(null);
    }
  }

  async function setAll(valor: Valor) {
    if (blocked) return;

    const prev = values; // para revertir si falla
    const items = ACTIVIDADES.map((a) => ({ actividad: a.key, valor }));

    // optimista
    const next: Partial<Record<ActividadKey, Valor>> = {};
    for (const a of ACTIVIDADES) next[a.key] = valor;
    setValues(next);

    setSavingUi();
    setBulkBusy(true);

    try {
      const res = await fetch(`/api/dictamenes/${dictamenId}/avd-aivd`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo aplicar");

      setSavedUi();
    } catch (e: any) {
      setSaveUi("idle");
      setValues(prev);
      toast.error(e?.message ?? "Error aplicando a todas");
    } finally {
      setBulkBusy(false);
    }
  }

  async function clearAll() {
    if (blocked) return;

    const prev = values;

    // optimista
    setValues({});
    setSavingUi();
    setBulkBusy(true);

    try {
      const res = await fetch(`/api/dictamenes/${dictamenId}/avd-aivd`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo limpiar");

      setSavedUi();
    } catch (e: any) {
      setSaveUi("idle");
      setValues(prev);
      toast.error(e?.message ?? "Error limpiando");
    } finally {
      setBulkBusy(false);
    }
  }

  // ✅ Calcular y guardar totalCap1 en dictamenes + refrescar panel derecho
  async function calcularTotalCap1() {
    if (blocked) return;

    // ✅ Autocompletar en UI lo que falte con 0.0 (sin esperar al backend)
    setValues((prev) => {
      const next = { ...prev };
      for (const a of ACTIVIDADES) {
        if (!next[a.key]) next[a.key] = "0.0";
      }
      return next;
    });

    setSavingUi();
    setCalcBusy(true);

    try {
      const res = await fetch(`/api/dictamenes/${dictamenId}/avd-aivd/calcular`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo calcular");

      setTotalCap1(data.totalCap1 ?? null);
      setSavedUi();

      // ✅ Refresca automáticamente el RightPanel
      await queryClient.invalidateQueries({
        queryKey: ["dictamen-deficiencias-panel", dictamenId],
      });
    } catch (e: any) {
      setSaveUi("idle");
      toast.error(e?.message ?? "Error calculando total");
    } finally {
      setCalcBusy(false);
    }
  }

  const busy = Boolean(savingKey) || bulkBusy || calcBusy;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">AVD–AIVD</h3>
            <Chip>Título II · Cap. 1</Chip>
            <Chip>Procedimiento {procedimientoPcl}</Chip>

            {totalCap1 !== null ? (
              <Chip>
                Total Cap. 1:{" "}
                <span className="ml-1 font-semibold text-slate-800">{totalCap1}</span>
              </Chip>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">
            Seleccione el nivel de limitación por actividad (solo un valor).
          </p>
        </div>

        {/* contador + guardado discreto */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div>
            Diligenciadas:{" "}
            <span className="font-medium text-foreground">{doneCount}</span> /{" "}
            {ACTIVIDADES.length}
          </div>

          <div className="text-xs">
            {saveUi === "saving" ? (
              <span className="animate-pulse text-slate-500">Guardando…</span>
            ) : saveUi === "saved" ? (
              <span className="text-emerald-700">Guardado ✓</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bloqueo por procedimiento A */}
      {blocked ? (
        <div className="p-4 text-sm border rounded-lg">
          <p className="font-medium">Esta sección no aplica para Procedimiento A.</p>
          <p className="text-muted-foreground">
            La pestaña se habilita solo en Procedimiento B.
          </p>
        </div>
      ) : null}

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar actividad…"
          disabled={blocked}
          className="w-full px-3 text-sm border rounded-md h-9 bg-background sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={calcularTotalCap1}
            disabled={blocked || busy}
            className="px-3 text-sm text-white bg-blue-600 border rounded-md h-9 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Suma las limitaciones y guarda el total en el dictamen"
          >
            {calcBusy ? "Calculando…" : "Calcular"}
          </button>

          <button
            type="button"
            onClick={() => setAll("0.0")}
            disabled={blocked || busy}
            className="px-3 text-sm border rounded-md h-9 bg-muted hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Marcar todas 0.0
          </button>

          <button
            type="button"
            onClick={clearAll}
            disabled={blocked || busy}
            className="px-3 text-sm border rounded-md h-9 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar todo
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="border rounded-lg">
        <div className="grid grid-cols-1 gap-2 px-4 py-3 text-xs font-medium border-b bg-muted/40 text-muted-foreground sm:grid-cols-12">
          <div className="sm:col-span-8">Actividad</div>
          <div className="sm:col-span-4 sm:text-right">Valor</div>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Cargando…</div>
        ) : (
          <div className="divide-y">
            {filtered.map((a) => {
              const v = values[a.key];
              const rowDone = Boolean(v);

              return (
                <div
                  key={a.key}
                  className={[
                    "grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-12 transition-colors",
                    rowDone
                      ? "bg-emerald-50/60 border-l-4 border-emerald-400"
                      : "hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="sm:col-span-8">
                    <div className="flex items-center gap-2">
                      {rowDone ? (
                        <span
                          className="inline-flex w-2 h-2 rounded-full bg-emerald-500"
                          title="Diligenciado"
                        />
                      ) : (
                        <span
                          className="inline-flex w-2 h-2 rounded-full bg-slate-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="text-sm font-semibold text-slate-800">{a.label}</div>
                    </div>
                  </div>

                  <div className="flex sm:col-span-4 sm:justify-end">
                    <select
                      value={v ?? ""}
                      disabled={blocked || busy || savingKey === a.key}
                      onChange={(e) => {
                        const valor = e.target.value as Valor;
                        setValues((prev) => ({ ...prev, [a.key]: valor }));
                        saveOne(a.key, valor);
                      }}
                      className="h-9 w-full sm:w-[210px] rounded-md border bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>
                        Seleccionar…
                      </option>
                      {OPCIONES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">Sin resultados.</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
