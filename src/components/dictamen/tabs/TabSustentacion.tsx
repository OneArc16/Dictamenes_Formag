'use client';

import React, { useMemo } from 'react';
import toast from 'react-hot-toast';

import { useDictamenDraft } from '@/hooks/useDictamenDraft';
import { useDictamenSustentacion } from '@/hooks/useDictamenSustentacion';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function TabSustentacion({
  dictamenId,
  readOnly = false,
}: {
  dictamenId: number;
  readOnly?: boolean;
}) {
  // 1) Traemos el texto del servidor (solo lectura / carga inicial)
  const server = useDictamenSustentacion(dictamenId);

  const serverText = useMemo(
    () => server.data?.sustentacionObservaciones ?? '',
    [server.data?.sustentacionObservaciones]
  );

  /**
   * 2) Borrador local (Dexie)
   * - OJO: para “sembrar” el initialData con lo del servidor,
   *   pasamos dictamenId = null mientras server está cargando.
   */
  const draft = useDictamenDraft<{ sustentacionObservaciones: string }>({
    dictamenId: server.isLoading ? null : dictamenId,
    initialData: { sustentacionObservaciones: serverText },
    debounceMs: 800,
  });

  const text = draft.draft?.sustentacionObservaciones ?? '';

  const localStatus = readOnly
    ? 'Modo lectura'
    : !draft.loaded
    ? 'Cargando borrador…'
    : draft.saving
    ? 'Guardando borrador…'
    : 'Borrador local guardado';

  async function onSaveServer() {
    if (readOnly) return;

    try {
      await server.saveAsync(text);

      // ✅ toast único (no se apila)
      toast.success('Sustentación guardada', { id: 'sustentacion_manual_ok' });

      // opcional: refrescar lo del servidor
      server.refetch?.();
    } catch (e: any) {
      toast.error(e?.message ?? 'Error guardando sustentación', {
        id: 'sustentacion_manual_error',
      });
    }
  }

  if (server.isLoading && !draft.loaded) {
    return (
      <div className="bg-white border shadow-sm border-slate-200 rounded-xl">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="text-sm font-semibold text-slate-900">
            Sustentación y observaciones
          </div>
          <div className="mt-1 text-xs text-slate-500">Cargando…</div>
        </div>
        <div className="p-4 text-sm text-slate-600">Cargando contenido…</div>
      </div>
    );
  }

  if (server.isError) {
    return (
      <div className="bg-white border border-red-200 shadow-sm rounded-xl">
        <div className="px-4 py-3 border-b border-red-200 bg-red-50 rounded-t-xl">
          <div className="text-sm font-semibold text-red-900">
            Sustentación y observaciones
          </div>
          <div className="mt-1 text-xs text-red-700">
            Ocurrió un error cargando esta sección.
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-red-700">
            {server.error instanceof Error ? server.error.message : 'Error'}
          </div>

          <button
            type="button"
            onClick={() => server.refetch?.()}
            className="mt-3 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border shadow-sm border-slate-200 rounded-xl">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Sustentación y observaciones
            </div>
          </div>

          <button
            type="button"
            onClick={onSaveServer}
            disabled={readOnly || server.isSaving}
            className={cn(
              'inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium',
              readOnly || server.isSaving
                ? 'border-slate-200 bg-white text-slate-400 cursor-not-allowed'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            {server.isSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="p-4">
        <label className="text-xs text-slate-500">Texto</label>

        <textarea
          value={text}
          onChange={(e) =>
            draft.setDraft({
              sustentacionObservaciones: e.target.value,
            })
          }
          placeholder="Escriba aquí la sustentación y observaciones…"
          disabled={readOnly}
          rows={12}
          className={cn(
            'mt-1 w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm outline-none',
            'border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300',
            readOnly && 'opacity-70 cursor-not-allowed'
          )}
        />

        <div className="flex items-center justify-between mt-2">
          <div className="text-[11px] text-slate-500">{localStatus}</div>
          <div className="text-[11px] text-slate-500">
            {(text?.length ?? 0).toLocaleString()} caracteres
          </div>
        </div>
      </div>
    </div>
  );
}
