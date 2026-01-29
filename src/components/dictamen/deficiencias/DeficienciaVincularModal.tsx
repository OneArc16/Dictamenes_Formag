"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useBuscarDeficiencias, DeficienciaBuscarItem } from "@/hooks/useBuscarDeficiencias";

type Props = {
  open: boolean;
  dictamenId: number;
  diagnosticoId: number;
  onClose: () => void;
  onVinculada?: (def: DeficienciaBuscarItem) => void;
};

export default function DeficienciaVincularModal({
  open,
  dictamenId,
  diagnosticoId,
  onClose,
  onVinculada,
}: Props) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<DeficienciaBuscarItem | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: items = [], isLoading, error } = useBuscarDeficiencias(q);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setSelected(null);
    setSaving(false);
  }, [open]);

  const close = () => {
    if (saving) return;
    onClose();
  };

  const vincular = async () => {
    if (!selected) return;

    try {
      setSaving(true);

      const url = `/api/dictamenes/${dictamenId}/diagnosticos/${diagnosticoId}/deficiencias/vincular`;

      let res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deficienciaId: selected.id }),
      });

      // fallback si tu route quedó como PUT
      if (res.status === 405) {
        res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deficienciaId: selected.id }),
        });
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message ?? "No se pudo vincular la deficiencia.");

      toast.success("Deficiencia vinculada al diagnóstico.");
      onVinculada?.(selected);
      close();
    } catch (e: any) {
      toast.error(e?.message ?? "Error vinculando deficiencia.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      <div className="relative w-[min(820px,92vw)] rounded-lg bg-white shadow-xl border">
        <div className="px-5 py-4 border-b">
          <h3 className="text-base font-semibold text-gray-900">
            Vincular deficiencia al diagnóstico
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Busca una deficiencia y vínculala para que aparezca en el combo.
          </p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej: 7.2, hipertensión, plexo..."
              className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <p className="text-xs text-gray-500">Escribe mínimo 2 caracteres.</p>
          </div>

          <div className="border rounded-md">
            <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
              Resultados
            </div>

            <div className="max-h-[320px] overflow-auto">
              {q.trim().length < 2 && (
                <div className="p-3 text-sm text-gray-600">Empieza escribiendo para buscar.</div>
              )}

              {q.trim().length >= 2 && isLoading && (
                <div className="p-3 text-sm text-gray-600">Buscando…</div>
              )}

              {q.trim().length >= 2 && error && (
                <div className="p-3 text-sm text-red-600">Error buscando deficiencias.</div>
              )}

              {q.trim().length >= 2 && !isLoading && !error && items.length === 0 && (
                <div className="p-3 text-sm text-gray-600">No se encontraron resultados.</div>
              )}

              {items.map((it) => {
                const active = selected?.id === it.id;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setSelected(it)}
                    className={`w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-sky-50 ${
                      active ? "bg-sky-50 ring-1 ring-sky-200" : ""
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {it.tabla ? `[${it.tabla}] ` : ""}
                      {it.nombre}
                    </div>
                    <div className="text-xs text-gray-600">
                      Capítulo: {it.capitulo ?? "—"} · Tipo: {it.tipoTabla ?? "—"} · ID: {it.id}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={vincular}
            disabled={!selected || saving}
            className={`px-3 py-2 text-sm text-white rounded ${
              selected && !saving ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Vinculando..." : "Vincular"}
          </button>
        </div>
      </div>
    </div>
  );
}
