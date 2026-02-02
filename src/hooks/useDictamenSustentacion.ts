'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type SustentacionResponse = {
  ok: boolean;
  dictamenId: number;
  sustentacionObservaciones: string;
  updatedAt?: string;
  message?: string;
};

async function safeJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`API no devolvió JSON (${res.status}). Ej: ${text.slice(0, 120)}...`);
  }
  return res.json();
}

async function fetchSustentacion(dictamenId: number): Promise<SustentacionResponse> {
  const res = await fetch(`/api/dictamenes/${dictamenId}/sustentacion`, {
    cache: 'no-store',
    credentials: 'include',
  });

  const data = (await safeJson(res)) as SustentacionResponse;

  if (!res.ok || data?.ok === false) {
    throw new Error(data?.message ?? 'Error cargando sustentación');
  }

  return {
    ...data,
    sustentacionObservaciones: data.sustentacionObservaciones ?? '',
  };
}

async function putSustentacion(dictamenId: number, text: string): Promise<SustentacionResponse> {
  const res = await fetch(`/api/dictamenes/${dictamenId}/sustentacion`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sustentacionObservaciones: text }),
    credentials: 'include',
  });

  const data = (await safeJson(res)) as SustentacionResponse;

  if (!res.ok || data?.ok === false) {
    throw new Error(data?.message ?? 'Error guardando sustentación');
  }

  return {
    ...data,
    sustentacionObservaciones: data.sustentacionObservaciones ?? '',
  };
}

export function useDictamenSustentacion(dictamenId: number) {
  const queryClient = useQueryClient();
  const enabled = Number.isFinite(dictamenId) && dictamenId > 0;

  const query = useQuery<SustentacionResponse>({
    queryKey: ['dictamen', dictamenId, 'sustentacion'],
    enabled,
    queryFn: () => fetchSustentacion(dictamenId),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const mutation = useMutation({
    mutationFn: (text: string) => putSustentacion(dictamenId, text),

    // Optimistic update (para que el UI se vea inmediato)
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ['dictamen', dictamenId, 'sustentacion'] });

      const prev = queryClient.getQueryData<SustentacionResponse>([
        'dictamen',
        dictamenId,
        'sustentacion',
      ]);

      queryClient.setQueryData<SustentacionResponse>(
        ['dictamen', dictamenId, 'sustentacion'],
        {
          ok: true,
          dictamenId,
          sustentacionObservaciones: text,
          updatedAt: prev?.updatedAt,
        }
      );

      return { prev };
    },

    onError: (_err, _text, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['dictamen', dictamenId, 'sustentacion'], ctx.prev);
      }
    },

    onSuccess: (server) => {
      queryClient.setQueryData(['dictamen', dictamenId, 'sustentacion'], server);
    },
  });

  return {
    ...query,
    save: mutation.mutate,
    saveAsync: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
