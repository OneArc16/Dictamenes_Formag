'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { db, DictamenDraft } from '@/lib/dexieClient';

type UseDictamenDraftOptions<T> = {
  /** ID del dictamen. Si es nuevo, podemos usar 0 o un id temporal Ãºnico */
  dictamenId: number | null;
  /** Estado inicial del formulario/bloque */
  initialData: T;
  /** Milisegundos de debounce para guardar (por defecto 800ms) */
  debounceMs?: number;
};

export function useDictamenDraft<T>({
  dictamenId,
  initialData,
  debounceMs = 800,
}: UseDictamenDraftOptions<T>) {
  const [draft, setDraft] = useState<T>(initialData);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serializedInitialData = useMemo(() => JSON.stringify(initialData ?? null), [initialData]);
  const serializedDraft = useMemo(() => JSON.stringify(draft ?? null), [draft]);

  // 1) Cargar desde Dexie al montar
  useEffect(() => {
    if (!dictamenId) return;

    let cancelled = false;

    (async () => {
      try {
        const row = await db.dictamenDrafts.get(dictamenId);
        if (!cancelled) {
          setHasLocalDraft(Boolean(row?.data));

          if (row?.data) {
            // Mezclar borrador con initialData por si hay nuevos campos
            setDraft((prev) => ({
              ...prev,
              ...row.data,
            }));
          }
        }
      } catch (err) {
        console.error('Error cargando borrador de dictamen desde Dexie:', err);
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dictamenId]);

  // 1.1) Si no existe borrador local, hidratar desde initialData cuando llegue del servidor
  useEffect(() => {
    if (!loaded) return;
    if (!dictamenId) return;
    if (hasLocalDraft) return;

    setDraft(initialData);
  }, [initialData, loaded, dictamenId, hasLocalDraft]);

  // 2) Autosave a Dexie cada vez que cambia draft (con debounce)
  useEffect(() => {
    if (!loaded) return;
    if (!dictamenId) return;

    if (!hasLocalDraft && serializedDraft === serializedInitialData) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const payload: DictamenDraft = {
          id: dictamenId,
          data: draft,
          updatedAt: Date.now(),
        };
        await db.dictamenDrafts.put(payload);
        setHasLocalDraft(true);
      } catch (err) {
        console.error('Error guardando borrador de dictamen en Dexie:', err);
      } finally {
        setSaving(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [draft, loaded, dictamenId, debounceMs, hasLocalDraft, serializedDraft, serializedInitialData]);

  // Helper para actualizar un campo concreto
  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Para limpiar el borrador (por ejemplo, al CERRAR dictamen)
  const clearDraft = async () => {
    if (!dictamenId) return;
    try {
      await db.dictamenDrafts.delete(dictamenId);
      setHasLocalDraft(false);
    } catch (err) {
      console.error('Error eliminando borrador de dictamen de Dexie:', err);
    }
  };

  return {
    draft,
    setDraft,
    updateField,
    loaded,
    saving,
    clearDraft,
  };
}



