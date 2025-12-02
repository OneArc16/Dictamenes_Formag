// src/hooks/useCie10Search.ts
'use client';

import { useCallback, useRef, useState } from 'react';
import type { SearchableOption } from '@/components/forms/SearchableSelect';

type UseCie10SearchResult = {
  options: SearchableOption[];
  loading: boolean;
  error: string | null;
  /** Lanza una búsqueda; internamente tiene debounce y mínimo 3 caracteres */
  search: (query: string) => void;
};

export function useCie10Search(): UseCie10SearchResult {
  const [options, setOptions] = useState<SearchableOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef<string>('');

  const search = useCallback((rawQuery: string) => {
    const q = rawQuery.trim();

    // limpiamos cualquier debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      // Menos de 3 caracteres → no buscamos, limpiamos
      if (q.length < 3) {
        if (abortRef.current) {
          abortRef.current.abort();
        }
        lastQueryRef.current = q;
        setOptions([]);
        setLoading(false);
        setError(null);
        return;
      }

      // Si es exactamente la misma búsqueda, no repetimos
      if (q === lastQueryRef.current) {
        return;
      }
      lastQueryRef.current = q;

      // Cancelar request previa si existía
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/cie10/search?q=${encodeURIComponent(q)}&limit=40`,
          { signal: controller.signal },
        );

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
          setError(data?.error ?? 'Error buscando CIE10.');
          setOptions([]);
          return;
        }

        setOptions(data.options ?? []);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // búsqueda cancelada → no hacemos nada
          return;
        }
        console.error('Error en búsqueda CIE10:', err);
        setError('Error buscando CIE10.');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce 300ms
  }, []);

  return { options, loading, error, search };
}
