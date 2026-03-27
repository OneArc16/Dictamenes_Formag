'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

type CerrarDictamenResponse = {
  ok: boolean;
  dictamenId: number;
  estado: 'CERRADO' | 'PENDIENTE';
  updatedAt?: string;
  serverVersion?: string;
  message?: string;
};

type DictamenCacheShape = {
  readOnly?: boolean;
  serverVersion?: string;
  estado?: string;
  dictamenEstado?: string;
  dictamen?: {
    estado?: string;
    readOnly?: boolean;
  };
  data?: {
    readOnly?: boolean;
    estado?: string;
    dictamenEstado?: string;
    dictamen?: {
      estado?: string;
      readOnly?: boolean;
    };
  };
};

type MutationContext = {
  prevDictamen: unknown;
  prevPanel: unknown;
};

function isDictamenCacheShape(value: unknown): value is DictamenCacheShape {
  return typeof value === 'object' && value !== null;
}

function markClosedInCache(previous: unknown, serverVersion?: string): unknown {
  if (!isDictamenCacheShape(previous)) {
    return previous;
  }

  return {
    ...previous,
    readOnly: true,
    serverVersion: serverVersion ?? previous.serverVersion,
    estado: previous.estado ?? 'CERRADO',
    dictamenEstado: 'CERRADO',
    dictamen: previous.dictamen
      ? {
          ...previous.dictamen,
          estado: 'CERRADO',
          readOnly: true,
        }
      : previous.dictamen,
    data: previous.data
      ? {
          ...previous.data,
          readOnly: true,
          estado: previous.data.estado ?? 'CERRADO',
          dictamenEstado: 'CERRADO',
          dictamen: previous.data.dictamen
            ? {
                ...previous.data.dictamen,
                estado: 'CERRADO',
                readOnly: true,
              }
            : previous.data.dictamen,
        }
      : previous.data,
  } satisfies DictamenCacheShape;
}

async function safeJson(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '');
    throw new Error(`API no devolvio JSON (${response.status}). Ej: ${text.slice(0, 120)}...`);
  }

  return response.json();
}

async function postCerrarDictamen(dictamenId: number): Promise<CerrarDictamenResponse> {
  const response = await fetch(`/api/dictamenes/${dictamenId}/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = (await safeJson(response)) as CerrarDictamenResponse;

  if (!response.ok || data.ok === false) {
    throw new Error(data.message ?? 'Error cerrando dictamen');
  }

  return data;
}

export function useCerrarDictamen(dictamenId: number) {
  const queryClient = useQueryClient();

  return useMutation<CerrarDictamenResponse, Error, void, MutationContext>({
    mutationFn: () => postCerrarDictamen(dictamenId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['dictamen', dictamenId] });

      const prevDictamen = queryClient.getQueryData(['dictamen', dictamenId]);
      const prevPanel = queryClient.getQueryData(['dictamen-deficiencias-panel', dictamenId]);

      queryClient.setQueryData(['dictamen', dictamenId], (previous: unknown) => markClosedInCache(previous));
      queryClient.setQueryData(['dictamen-deficiencias-panel', dictamenId], (previous: unknown) =>
        markClosedInCache(previous),
      );

      window.dispatchEvent(new CustomEvent('dictamen:closed', { detail: { dictamenId } }));
      window.dispatchEvent(new CustomEvent('dictamen:estado_updated', { detail: { dictamenId } }));

      return { prevDictamen, prevPanel };
    },
    onError: (_error, _variables, context) => {
      if (context?.prevDictamen !== undefined) {
        queryClient.setQueryData(['dictamen', dictamenId], context.prevDictamen);
      }

      if (context?.prevPanel !== undefined) {
        queryClient.setQueryData(['dictamen-deficiencias-panel', dictamenId], context.prevPanel);
      }
    },
    onSuccess: async (server) => {
      queryClient.setQueryData(['dictamen', dictamenId], (previous: unknown) =>
        markClosedInCache(previous, server.serverVersion),
      );
      queryClient.setQueryData(['dictamen-deficiencias-panel', dictamenId], (previous: unknown) =>
        markClosedInCache(previous, server.serverVersion),
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen-deficiencias-panel', dictamenId] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId, 'titulo3'] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId, 'sustentacion'] }),
      ]);

      window.dispatchEvent(
        new CustomEvent('dictamen:closed', {
          detail: { dictamenId, serverVersion: server.serverVersion },
        }),
      );
      window.dispatchEvent(new CustomEvent('dictamen:estado_updated', { detail: { dictamenId } }));
    },
  });
}
