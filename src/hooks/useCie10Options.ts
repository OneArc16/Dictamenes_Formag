'use client';

import { useQuery } from '@tanstack/react-query';
import type { SearchableOption } from '@/components/forms/SearchableSelect';

type Cie10ApiItem = {
  codigo: string;
  nombre: string;
};

async function fetchCie10Options(): Promise<SearchableOption[]> {
  const res = await fetch('/api/cie10');

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Error al obtener /api/cie10:', res.status, text);
    throw new Error(
      `No se pudo obtener el catálogo CIE10 (HTTP ${res.status})`
    );
  }

  const data = (await res.json()) as Cie10ApiItem[];

  return data.map((item) => ({
    value: item.codigo,
    label: `${item.codigo} - ${item.nombre}`,
  }));
}

export function useCie10Options() {
  return useQuery<SearchableOption[], Error>({
    queryKey: ['cie10-options'],
    queryFn: fetchCie10Options,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}
