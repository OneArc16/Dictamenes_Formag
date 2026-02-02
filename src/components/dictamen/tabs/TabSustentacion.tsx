'use client';

import React, { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { useDictamenSustentacion } from '@/hooks/useDictamenSustentacion';
import { useDictamenDraft } from '@/hooks/useDictamenDraft';

type TipoEvento = 'ENFERMEDAD' | 'ACCIDENTE';
type OrigenEvento = 'LABORAL' | 'COMUN';

type Props = {
  dictamenId: number;
  readOnly?: boolean;
  initialMeta?: {
    fechaEstructuracionInvalidez: string | null; // YYYY-MM-DD
    tipoEvento: TipoEvento | null;
    origenEvento: OrigenEvento | null;
  };
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

async function safeJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`API no devolvió JSON (${res.status}). Ej: ${text.slice(0, 120)}...`);
  }
  return res.json();
}

async function putMeta(dictamenId: number, body: {
  fechaEstructuracionInvalidez?: string | null;
  tipoEvento?: TipoEvento | null;
  origenEvento?: OrigenEvento | null;
}) {
  const res = await fetch(`/api/dictamenes/${dictamenId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error ?? data?.message ?? 'Error guardando datos de estructuración/origen');
  }

  return data;
}

export default function TabSustentacion({ dictamenId, readOnly = false, initialMeta }: Props) {
  const sustentacion = useDictamenSustentacion(dictamenId);

  // defaults (por si aún no llega initialMeta)
  const initialFecha = initialMeta?.fechaEstructuracionInvalidez ?? null;
  const initialTipo = initialMeta?.tipoEvento ?? null;
  const initialOrigen = initialMeta?.origenEvento ?? null;

  // ✅ base inicial desde servidor (texto) + meta inicial desde props
  const initialData = useMemo(
    () => ({
      sustentacionObservaciones: sustentacion.data?.sustentacionObservaciones ?? '',
      fechaEstructuracionInvalidez: initialFecha ?? '',
      tipoEvento: initialTipo as TipoEvento | null,
      origenEvento: initialOrigen as OrigenEvento | null,
    }),
    // ojo: se recalcula cuando llega el GET de sustentación
    [sustentacion.data?.sustentacionObservaciones, initialFecha, initialTipo, initialOrigen],
  );

  // ✅ Dexie draft
  const draftHook = useDictamenDraft({
    dictamenId,
    initialData,
    debounceMs: 800,
  });

  const draft = draftHook.draft;

  // Si todavía no hay data del server y no ha cargado Dexie, muestra loader suave
  const isBooting = sustentacion.isLoading || !draftHook.loaded;

  const saveMetaMutation = useMutation({
    mutationFn: (payload: {
      fechaEstructuracionInvalidez?: string | null;
      tipoEvento?: TipoEvento | null;
      origenEvento?: OrigenEvento | null;
    }) => putMeta(dictamenId, payload),
  });

  // ✅ botón Guardar: guarda 1) texto sustentación 2) meta estructuración/origen
  const onSave = async () => {
    if (readOnly) return;

    const text = String(draft?.sustentacionObservaciones ?? '');
    const fecha = String(draft?.fechaEstructuracionInvalidez ?? '').trim();
    const tipo = (draft?.tipoEvento ?? null) as TipoEvento | null;
    const origen = (draft?.origenEvento ?? null) as OrigenEvento | null;

    try {
      await Promise.all([
        sustentacion.saveAsync(text),
        saveMetaMutation.mutateAsync({
          fechaEstructuracionInvalidez: fecha ? fecha : null,
          tipoEvento: tipo,
          origenEvento: origen,
        }),
      ]);

      toast.success('Sustentación guardada');
    } catch (err: any) {
      toast.error(err?.message ?? 'No se pudo guardar');
    }
  };

  // Si el servidor devuelve error cargando sustentación
  if (sustentacion.isError) {
    return (
      <div className="bg-white border shadow-sm rounded-xl">
        <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
          <div className="text-sm font-semibold text-slate-900">Sustentación y observaciones</div>
          <div className="mt-1 text-xs text-slate-500">Ocurrió un error cargando la sección.</div>
        </div>

        <div className="p-4">
          <div className="text-sm text-red-600">
            {sustentacion.error instanceof Error ? sustentacion.error.message : 'Error'}
          </div>

          <button
            type="button"
            onClick={() => sustentacion.refetch()}
            className="inline-flex items-center px-3 py-2 mt-3 text-sm bg-white border rounded-lg border-slate-200 hover:bg-slate-50"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border shadow-sm rounded-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b bg-slate-50 rounded-t-xl">
        <div>
          <div className="text-sm font-semibold text-slate-900">Sustentación y observaciones</div>
          <div className="mt-1 text-xs text-slate-500">
            Escriba la sustentación clínica/ocupacional y cualquier observación relevante.
            <br />
            Se guarda en borrador local automáticamente (Dexie). Use <b>Guardar</b> para enviar a la BD.
          </div>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={onSave}
            disabled={isBooting || sustentacion.isSaving || saveMetaMutation.isPending}
            className={cn(
              'inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium',
              'border-slate-200 bg-white hover:bg-slate-50',
              (isBooting || sustentacion.isSaving || saveMetaMutation.isPending) &&
                'opacity-60 cursor-not-allowed',
            )}
          >
            {sustentacion.isSaving || saveMetaMutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {isBooting ? (
          <div className="text-sm text-slate-500">Cargando…</div>
        ) : (
          <>
            {/* Textarea */}
            <div>
              <label className="block text-xs text-slate-600">Texto</label>
              <textarea
                value={draft.sustentacionObservaciones ?? ''}
                onChange={(e) =>
                  draftHook.setDraft({
                    ...draft,
                    sustentacionObservaciones: e.target.value,
                  })
                }
                disabled={readOnly}
                rows={10}
                className={cn(
                  'mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none',
                  'focus:ring-2 focus:ring-blue-100 focus:border-blue-300',
                  readOnly && 'bg-slate-50',
                )}
                placeholder="Escribe aquí la sustentación…"
              />

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {draftHook.saving ? 'Guardando borrador local…' : 'Borrador local actualizado.'}
                </span>
                <span>{(draft.sustentacionObservaciones ?? '').length} caracteres</span>
              </div>
            </div>

            {/* ✅ NUEVOS CAMPOS ABAJO */}
            <div className="pt-4 border-t border-slate-200">
              <div className="text-sm font-semibold text-slate-900">
                Fecha de estructuración y calificación del origen
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Estos datos corresponden al recuadro “Fecha de estructuración de la invalidez” y “Calificaciones del origen”.
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-3">
                {/* Fecha estructuración */}
                <div>
                  <label className="block text-xs text-slate-600">
                    Fecha de estructuración de la invalidez
                  </label>
                  <input
                    type="date"
                    value={draft.fechaEstructuracionInvalidez ?? ''}
                    onChange={(e) =>
                      draftHook.setDraft({
                        ...draft,
                        fechaEstructuracionInvalidez: e.target.value,
                      })
                    }
                    disabled={readOnly}
                    className={cn(
                      'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none',
                      'focus:ring-2 focus:ring-blue-100 focus:border-blue-300',
                      readOnly && 'bg-slate-50',
                    )}
                  />
                </div>

                {/* Tipo evento */}
                <div>
                  <div className="block text-xs text-slate-600">Tipo de evento</div>
                  <div className="flex gap-2 mt-2">
                    {(['ENFERMEDAD', 'ACCIDENTE'] as TipoEvento[]).map((v) => {
                      const active = draft.tipoEvento === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          disabled={readOnly}
                          onClick={() =>
                            draftHook.setDraft({
                              ...draft,
                              tipoEvento: v,
                            })
                          }
                          className={cn(
                            'flex-1 rounded-lg border px-3 py-2 text-sm',
                            active
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                            readOnly && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          {v === 'ENFERMEDAD' ? 'Enfermedad' : 'Accidente'}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      draftHook.setDraft({
                        ...draft,
                        tipoEvento: null,
                      })
                    }
                    className={cn(
                      'mt-2 text-[11px] text-slate-500 hover:underline',
                      readOnly && 'cursor-not-allowed opacity-60 hover:no-underline',
                    )}
                  >
                    Limpiar
                  </button>
                </div>

                {/* Origen */}
                <div>
                  <div className="block text-xs text-slate-600">Origen</div>
                  <div className="flex gap-2 mt-2">
                    {(['LABORAL', 'COMUN'] as OrigenEvento[]).map((v) => {
                      const active = draft.origenEvento === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          disabled={readOnly}
                          onClick={() =>
                            draftHook.setDraft({
                              ...draft,
                              origenEvento: v,
                            })
                          }
                          className={cn(
                            'flex-1 rounded-lg border px-3 py-2 text-sm',
                            active
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                            readOnly && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          {v === 'LABORAL' ? 'Laboral' : 'Común'}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      draftHook.setDraft({
                        ...draft,
                        origenEvento: null,
                      })
                    }
                    className={cn(
                      'mt-2 text-[11px] text-slate-500 hover:underline',
                      readOnly && 'cursor-not-allowed opacity-60 hover:no-underline',
                    )}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {readOnly && (
                <div className="px-3 py-2 mt-4 text-xs border rounded-lg border-amber-200 bg-amber-50 text-amber-800">
                  Dictamen en modo solo lectura. No se permite editar.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
