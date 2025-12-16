"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useEliminarDeficienciaAsignada } from "@/hooks/useEliminarDeficienciaAsignada";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Item = {
  id: number;
  creadoEn: string;
  valorDeficiencia: any; // ✅ soporta Decimal/number/string/null
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

function toNumberSafe(value: any): number | null {
  if (value === null || value === undefined) return null;

  // Prisma Decimal suele traer toNumber()/toString()
  if (typeof value === "object") {
    if (typeof value.toNumber === "function") {
      const n = value.toNumber();
      return Number.isNaN(n) ? null : n;
    }
    if (typeof value.toString === "function") {
      const s = String(value.toString()).trim();
      if (!s) return null;
      const n = Number(s.replace(",", "."));
      return Number.isNaN(n) ? null : n;
    }
    return null;
  }

  if (typeof value === "number") return Number.isNaN(value) ? null : value;

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;
    const n = Number(s.replace(",", "."));
    return Number.isNaN(n) ? null : n;
  }

  return null;
}

function formatPorcentaje(value: any) {
  const n = toNumberSafe(value);
  if (n === null) return "—";
  const show = Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
  return `${show}%`;
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
  const eliminar = useEliminarDeficienciaAsignada();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);

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

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Deficiencias asignadas</h2>

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
                <th className="py-2 pr-3 whitespace-nowrap">Detalle (Clase/Nervio)</th>
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
