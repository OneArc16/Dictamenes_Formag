// src/hooks/useDiagnosticosDraft.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  db,
  DictamenDiagnosticosDraft,
  DiagnosticoRowDraft,
} from '@/lib/dexieClient';

export type { DiagnosticoRowDraft } from '@/lib/dexieClient';

export type TipoDiagnosticoLocal =
  | 'CONFIRMADO_NUEVO'
  | 'IMPRESION_DIAGNOSTICA'
  | 'CONFIRMADO_REPETIDO';

export function useDiagnosticosDraft(dictamenId: number | null) {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoRowDraft[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) Cargar desde Dexie al montar
  useEffect(() => {
    if (!dictamenId) return;

    let cancelled = false;

    (async () => {
      try {
        const row = await db.dictamenDiagnosticosDrafts.get(dictamenId);
        if (!cancelled && row?.diagnosticos) {
          setDiagnosticos(row.diagnosticos);
        }
      } catch (err) {
        console.error('Error cargando borrador diagnósticos Dexie:', err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dictamenId]);

  // 2) Autosave a Dexie cada vez que cambie diagnosticos (con debounce)
  useEffect(() => {
    if (!loaded) return;
    if (!dictamenId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const payload: DictamenDiagnosticosDraft = {
          id: dictamenId,
          diagnosticos,
          updatedAt: Date.now(),
        };
        await db.dictamenDiagnosticosDrafts.put(payload);
      } catch (err) {
        console.error('Error guardando borrador diagnósticos Dexie:', err);
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [diagnosticos, loaded, dictamenId]);

  const clearDiagnosticosDraft = async () => {
    if (!dictamenId) return;
    try {
      await db.dictamenDiagnosticosDrafts.delete(dictamenId);
    } catch (err) {
      console.error('Error eliminando borrador diagnósticos Dexie:', err);
    }
  };

  return {
    diagnosticos,
    setDiagnosticos,
    loaded,
    saving,
    clearDiagnosticosDraft,
  };
}
