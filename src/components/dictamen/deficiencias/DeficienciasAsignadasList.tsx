"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEliminarDeficienciaAsignada } from "@/hooks/useEliminarDeficienciaAsignada";
import { useCalcularTotalTitulo1 } from "@/hooks/useCalcularTotalTitulo1";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Item = {
  id: number;
  creadoEn: string;
  valorDeficiencia: number | string | null;
  deficiencia: {
    id: number;
    nombre: string;
    tabla: string;
    capitulo: string | null;
    tipoTabla: string | null;
  };
  clase: { id: number; nombre: string } | null;
  nervio: { id: number; nombre: string } | null;
};

function formatPorcentaje(value: Item["valorDeficiencia"]) {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "—";
  return `${n}%`;
}

function formatFecha(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function DeficienciasAsignadasList({
  dictamenId,
  items,
}: {
  dictamenId: number;
  items: Item[];
}) {
  const qc = useQueryClient();

  const eliminar = useEliminarDeficienciaAsignada();
  const calcularTotal = useCalcularTotalTitulo1();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);

  // ✅ Mostrar total calculado (sin depender de refrescar página)
  const [totalTitulo1, setTotalTitulo1] = useState<number | null>(null);
  const [procedimiento, setProcedimiento] = useState<"A" | "B" | null>(null);

  const descConfirm = useMemo(() => {
    if (!selected) return null;

    const detalle = selected.clase?.nombre ?? selected.nervio?.nombre ?? "—";

    return (
      <div className="space-y-2">
        <p className="text-gray-700">¿Eliminar esta deficiencia asignada?</p>

        <div className="p-3 text-sm border rounded-md bg-gray-50">
          <p className="font-medium text-gray-900">
            {selected.deficiencia?.nombre ?? "—"}
          </p>
          <p className="mt-1 text-gray-700">
            <span className="font-medium">Detalle:</span> {detalle}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Valor:</span>{" "}
            {formatPorcentaje(selected.valorDeficiencia)}
          </p>
        </div>

        <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
      </div>
    );
  }, [selected]);

  const abrirConfirm = (item: Item) => {
    setSelected(item);
    setOpenConfirm(true);
  };

  const cerrarConfirm = () => {
    if (eliminar.isPending) return;
    setOpenConfirm(false);
    setSelected(null);
  };

  const confirmarEliminar = async () => {
    if (!selected) return;

    try {
      await eliminar.mutateAsync({
        dictamenId,
        dictamenDeficienciaId: selected.id,
      });

      toast.success("Deficiencia eliminada");
      cerrarConfirm();
    } catch (e: any) {
      toast.error(e.message ?? "Error eliminando deficiencia");
    }
  };

  const invalidateAfterSave = async () => {
    await qc.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey;
        if (!Array.isArray(key)) return false;

        const hasDictamen = key.includes(dictamenId);
        const hasWords = key.some(
          (k) =>
            typeof k === "string" &&
            (k.includes("deficien") ||
              k.includes("diagnost") ||
              k.includes("panel") ||
              k.includes("opcion") ||
              k.includes("dictamen"))
        );

        return hasDictamen && hasWords;
      },
      refetchType: "active",
    });
  };

  const handleCalcular = async () => {
    try {
      const resp = await calcularTotal.mutateAsync({ dictamenId });
      setTotalTitulo1(resp.dictamen.totalTitulo1 ?? 0);
      setProcedimiento(resp.dictamen.procedimientoPcl);

      toast.success("Total título 1 calculado y guardado");
      await invalidateAfterSave();
    } catch (e: any) {
      toast.error(e.message ?? "Error calculando total");
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">Deficiencias asignadas</h2>

        {/* ✅ Botón calcular + resultado */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-700">
            <span className="font-medium">Total Título I:</span>{" "}
            <span className="font-semibold">
              {totalTitulo1 === null ? "—" : `${totalTitulo1}%`}
            </span>
            {procedimiento && (
              <span className="ml-2 text-xs text-slate-500">
                (Proc. {procedimiento} · máx {procedimiento === "A" ? "75" : "50"}%)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCalcular}
            disabled={calcularTotal.isPending}
            className="px-3 py-1 text-sm text-white rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
          >
            {calcularTotal.isPending ? "Calculando..." : "Calcular"}
          </button>
        </div>
      </div>

      {(!items || items.length === 0) && (
        <p className="text-sm text-gray-600">
          Aún no hay deficiencias asignadas a este dictamen.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Descripción</th>
                <th className="py-2 pr-3 whitespace-nowrap">Capítulo</th>
                <th className="py-2 pr-3 whitespace-nowrap">Tabla</th>
                <th className="py-2 pr-3 whitespace-nowrap">
                  Detalle (Clase/Nervio)
                </th>
                <th className="py-2 pr-3 whitespace-nowrap">Valor</th>
                <th className="py-2 pr-3 whitespace-nowrap">Fecha</th>
                <th className="py-2 pr-3 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.map((it) => {
                const detalle = it.clase?.nombre ?? it.nervio?.nombre ?? "—";

                return (
                  <tr key={it.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-3 min-w-[320px]">
                      <div className="font-medium text-gray-900">
                        {it.deficiencia?.nombre ?? "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tipo: {it.deficiencia?.tipoTabla ?? "—"}
                      </div>
                    </td>

                    <td className="py-2 pr-3 whitespace-nowrap">
                      {it.deficiencia?.capitulo ?? "—"}
                    </td>

                    <td className="py-2 pr-3 whitespace-nowrap">
                      {it.deficiencia?.tabla ?? "—"}
                    </td>

                    <td className="py-2 pr-3 whitespace-nowrap">{detalle}</td>

                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                      {formatPorcentaje(it.valorDeficiencia)}
                    </td>

                    <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                      {formatFecha(it.creadoEn)}
                    </td>

                    <td className="py-2 pr-3 whitespace-nowrap">
                      <button
                        onClick={() => abrirConfirm(it)}
                        className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={openConfirm}
        title="Eliminar deficiencia"
        description={descConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={eliminar.isPending}
        onCancel={cerrarConfirm}
        onConfirm={confirmarEliminar}
      />
    </div>
  );
}

export default DeficienciasAsignadasList;
