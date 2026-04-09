'use client';

import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';

import type { DictamenRow, EstadoDictamenFiltro } from '@/components/dictamen/types';

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

type DictamenListFilters = {
  estado?: EstadoDictamenFiltro[] | string[] | string;
};

type QuerySnapshot = [QueryKey, unknown];

type MutationContext = {
  prevDictamen: unknown;
  prevPanel: unknown;
  prevMedicoLists: QuerySnapshot[];
  prevAdmisionesLists: QuerySnapshot[];
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

function extractListFilters(queryKey: QueryKey): DictamenListFilters | undefined {
  const maybeFilters = queryKey[1];
  return typeof maybeFilters === 'object' && maybeFilters !== null
    ? (maybeFilters as DictamenListFilters)
    : undefined;
}

function normalizeEstadoFilters(filters?: DictamenListFilters): EstadoDictamenFiltro[] {
  const raw = filters?.estado;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values.map((value) => String(value).toUpperCase() as EstadoDictamenFiltro);
}

function shouldKeepClosedRow(filters: EstadoDictamenFiltro[]) {
  if (filters.length === 0) return true;
  return filters.includes('TODOS') || filters.includes('CERRADOS');
}

function updateClosedInList(
  previous: unknown,
  dictamenId: number,
  filters?: DictamenListFilters,
): unknown {
  if (!Array.isArray(previous)) {
    return previous;
  }

  const rows = previous as DictamenRow[];
  if (!rows.some((row) => row.id === dictamenId)) {
    return previous;
  }

  if (!shouldKeepClosedRow(normalizeEstadoFilters(filters))) {
    return rows.filter((row) => row.id !== dictamenId);
  }

  return rows.map((row) =>
    row.id === dictamenId
      ? {
          ...row,
          estado: 'CERRADO',
        }
      : row,
  );
}

function patchClosedListQueries(
  queryClient: QueryClient,
  prefix: QueryKey,
  dictamenId: number,
): QuerySnapshot[] {
  const entries = queryClient.getQueriesData({ queryKey: prefix }) as QuerySnapshot[];

  for (const [queryKey, previous] of entries) {
    queryClient.setQueryData(queryKey, updateClosedInList(previous, dictamenId, extractListFilters(queryKey)));
  }

  return entries;
}

function restoreQuerySnapshots(queryClient: QueryClient, snapshots: QuerySnapshot[]) {
  for (const [queryKey, previous] of snapshots) {
    queryClient.setQueryData(queryKey, previous);
  }
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
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['dictamen', dictamenId] }),
        queryClient.cancelQueries({ queryKey: ['dictamen-deficiencias-panel', dictamenId] }),
        queryClient.cancelQueries({ queryKey: ['dictamenes-medico'] }),
        queryClient.cancelQueries({ queryKey: ['dictamenes-admisiones'] }),
      ]);

      const prevDictamen = queryClient.getQueryData(['dictamen', dictamenId]);
      const prevPanel = queryClient.getQueryData(['dictamen-deficiencias-panel', dictamenId]);
      const prevMedicoLists = patchClosedListQueries(queryClient, ['dictamenes-medico'], dictamenId);
      const prevAdmisionesLists = patchClosedListQueries(queryClient, ['dictamenes-admisiones'], dictamenId);

      queryClient.setQueryData(['dictamen', dictamenId], (previous: unknown) => markClosedInCache(previous));
      queryClient.setQueryData(['dictamen-deficiencias-panel', dictamenId], (previous: unknown) =>
        markClosedInCache(previous),
      );

      window.dispatchEvent(new CustomEvent('dictamen:closed', { detail: { dictamenId } }));
      window.dispatchEvent(new CustomEvent('dictamen:estado_updated', { detail: { dictamenId } }));

      return { prevDictamen, prevPanel, prevMedicoLists, prevAdmisionesLists };
    },
    onError: (_error, _variables, context) => {
      if (context?.prevDictamen !== undefined) {
        queryClient.setQueryData(['dictamen', dictamenId], context.prevDictamen);
      }

      if (context?.prevPanel !== undefined) {
        queryClient.setQueryData(['dictamen-deficiencias-panel', dictamenId], context.prevPanel);
      }

      if (context?.prevMedicoLists) {
        restoreQuerySnapshots(queryClient, context.prevMedicoLists);
      }

      if (context?.prevAdmisionesLists) {
        restoreQuerySnapshots(queryClient, context.prevAdmisionesLists);
      }
    },
    onSuccess: async (server) => {
      patchClosedListQueries(queryClient, ['dictamenes-medico'], dictamenId);
      patchClosedListQueries(queryClient, ['dictamenes-admisiones'], dictamenId);

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
        queryClient.invalidateQueries({ queryKey: ['dictamenes-medico'] }),
        queryClient.invalidateQueries({ queryKey: ['dictamenes-admisiones'] }),
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
