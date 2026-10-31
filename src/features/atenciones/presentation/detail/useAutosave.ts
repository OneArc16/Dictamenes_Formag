'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY_MS = 800;

function sameValue<T>(left: T, right: T) {
  return left === right || JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Valor editable que se guarda solo tras una pausa al escribir. `persist` recibe lo que hay en
 * pantalla y lo último guardado; lo enviado pasa a ser la referencia de "sin cambios".
 */
export function useAutosave<T>({
  initial,
  editable,
  persist,
}: {
  initial: T;
  editable: boolean;
  persist: (value: T, saved: T) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const valueRef = useRef(initial);
  const savedRef = useRef(initial);
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const persistRef = useRef(persist);
  useEffect(() => {
    persistRef.current = persist;
  }, [persist]);

  const flush = useCallback(async (): Promise<boolean> => {
    // Un guardado a la vez; el siguiente toma lo que se haya escrito mientras tanto.
    if (inFlightRef.current) await inFlightRef.current;
    const toSave = valueRef.current;
    if (sameValue(toSave, savedRef.current)) return true;

    const request = (async () => {
      setStatus('saving');
      try {
        await persistRef.current(toSave, savedRef.current);
        savedRef.current = toSave;
        setError(null);
        setStatus('saved');
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo guardar.');
        setStatus('error');
        return false;
      }
    })();
    inFlightRef.current = request;
    try {
      return await request;
    } finally {
      inFlightRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!editable || sameValue(value, savedRef.current)) return;
    const timer = window.setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [editable, value, flush]);

  // Evita perder lo escrito si se cierra la pestaña antes del guardado automático.
  useEffect(() => {
    if (!editable) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (!sameValue(valueRef.current, savedRef.current)) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [editable]);

  const update = useCallback((updater: (current: T) => T) => {
    setValue((current) => {
      const next = updater(current);
      valueRef.current = next;
      return next;
    });
  }, []);

  return { value, update, status, error, flush };
}

/** Respuesta JSON de las rutas de Atenciones; lanza el mensaje del servidor si falla. */
export async function atencionRequest<T>(url: string, body: unknown, fallbackError: string): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(data?.message ?? fallbackError);
  return data.data as T;
}
