'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/dexieClient';

export type TipoDiagnosticoLocal =
  | 'CONFIRMADO_NUEVO'
  | 'IMPRESION_DIAGNOSTICA'
  | 'CONFIRMADO_REPETIDO';

export type DiagnosticoRowDraft = {
  id: string;               // para usar como key en la UI
  cie10Codigo?: string;     // ej: "M54.5"
  cie10Label?: string;      // ej: "M54.5 - LUMBAGO"
  tipo: TipoDiagnosticoLocal;
};

export type DiagnosticosDraftState = {
  diagnosticos: DiagnosticoRowDraft[];
};

const INITIAL_DIAGNOSTICOS_STATE: DiagnosticosDraftState = {
  diagnosticos: [],
};

export function useDiagnosticosDraft(dictamenId: number | null) {
  const [state, setState] = useState<DiagnosticosDraftState>(
    INITIAL_DIAGNOSTICOS_STATE,
  );
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar desde Dexie cuando cambia el dictamenId
  useEffect(() => {
    if (!dictamenId) {
      setState(INITIAL_DIAGNOSTICOS_STATE);
      setLoaded(true);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const row = await db.dictamenDrafts.get(dictamenId);
        if (cancelled) return;

        const saved = row?.data?.diagnosticos;
        if (Array.isArray(saved)) {
          setState({ diagnosticos: saved });
        } else {
          setState(INITIAL_DIAGNOSTICOS_STATE);
        }
      } catch (err) {
        console.error('Error cargando borrador de diagnósticos', err);
        setState(INITIAL_DIAGNOSTICOS_STATE);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    setLoaded(false);
    load();

    return () => {
      cancelled = true;
    };
  }, [dictamenId]);

  // 💾 Guardar automáticamente en Dexie cada vez que cambian los diagnósticos
  useEffect(() => {
    if (!dictamenId) return;
    if (!loaded) return;

    let cancelled = false;

    const save = async () => {
      try {
        setSaving(true);
        await db.transaction('rw', db.dictamenDrafts, async () => {
          const prev = await db.dictamenDrafts.get(dictamenId);

          const newData = {
            ...(prev?.data ?? {}),
            diagnosticos: state.diagnosticos,
          };

          await db.dictamenDrafts.put({
            id: dictamenId,
            data: newData,
            updatedAt: Date.now(),
          });
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Error guardando borrador de diagnósticos', err);
        }
      } finally {
        if (!cancelled) {
          setSaving(false);
        }
      }
    };

    save();

    return () => {
      cancelled = true;
    };
  }, [dictamenId, state, loaded]);

  const setDiagnosticos = (rows: DiagnosticoRowDraft[]) => {
    setState((prev) => ({ ...prev, diagnosticos: rows }));
  };

  const clearDraft = async () => {
    if (!dictamenId) return;
    try {
      await db.dictamenDrafts.delete(dictamenId);
    } catch (err) {
      console.error('Error limpiando borrador de dictamen', err);
    } finally {
      setState(INITIAL_DIAGNOSTICOS_STATE);
    }
  };

  return {
    diagnosticos: state.diagnosticos,
    setDiagnosticos,
    loaded,
    saving,
    clearDraft,
  };
}
