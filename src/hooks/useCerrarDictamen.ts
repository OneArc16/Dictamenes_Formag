'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

type CerrarDictamenResponse = {
  ok: boolean;
  dictamenId: number;
  estado: 'CERRADO' | 'PENDIENTE';
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

async function postCerrarDictamen(dictamenId: number): Promise<CerrarDictamenResponse> {
  const res = await fetch(`/api/dictamenes/${dictamenId}/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = (await safeJson(res)) as CerrarDictamenResponse;

  if (!res.ok || data?.ok === false) {
    throw new Error(data?.message ?? 'Error cerrando dictamen');
  }

  return data;
}

export function useCerrarDictamen(dictamenId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postCerrarDictamen(dictamenId),

    // ✅ OPTIMISTIC UPDATE: la UI se entera INMEDIATAMENTE
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['dictamen', dictamenId] });

      const prevDictamen = queryClient.getQueryData(['dictamen', dictamenId]);
      const prevPanel = queryClient.getQueryData(['dictamen-deficiencias-panel', dictamenId]);

      // 1) Cache del dictamen (EL QUE USA EL SHELL)
      queryClient.setQueryData(['dictamen', dictamenId], (prev: any) => {
        if (!prev?.dictamen) return prev;
        return {
          ...prev,
          readOnly: true,
          dictamen: {
            ...prev.dictamen,
            estado: 'CERRADO',
          },
        };
      });

      // 2) Cache del panel (opcional pero útil si lo muestras allí)
      queryClient.setQueryData(['dictamen-deficiencias-panel', dictamenId], (prev: any) => {
        if (!prev?.dictamen) return prev;
        return {
          ...prev,
          dictamen: {
            ...prev.dictamen,
            estado: 'CERRADO',
          },
        };
      });

      // ✅ Evento inmediato (para listeners de UI)
      window.dispatchEvent(
        new CustomEvent('dictamen:closed', { detail: { dictamenId } })
      );
      window.dispatchEvent(
        new CustomEvent('dictamen:estado_updated', { detail: { dictamenId } })
      );

      return { prevDictamen, prevPanel };
    },

    onError: (_err, _vars, ctx) => {
      // rollback
      if (ctx?.prevDictamen) queryClient.setQueryData(['dictamen', dictamenId], ctx.prevDictamen);
      if (ctx?.prevPanel) queryClient.setQueryData(['dictamen-deficiencias-panel', dictamenId], ctx.prevPanel);
    },

    onSuccess: async (server) => {
      // ✅ asegura que el estado final refleje el server (por si retorna algo distinto)
      queryClient.setQueryData(['dictamen', dictamenId], (prev: any) => {
        if (!prev?.dictamen) return prev;
        return {
          ...prev,
          readOnly: server.estado === 'CERRADO' ? true : prev.readOnly,
          dictamen: {
            ...prev.dictamen,
            estado: server.estado,
          },
        };
      });

      queryClient.setQueryData(['dictamen-deficiencias-panel', dictamenId], (prev: any) => {
        if (!prev?.dictamen) return prev;
        return {
          ...prev,
          dictamen: {
            ...prev.dictamen,
            estado: server.estado,
          },
        };
      });

      // ✅ invalidaciones para sincronizar totales/otras tabs SIN reload
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen-deficiencias-panel', dictamenId] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId, 'titulo3'] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId, 'sustentacion'] }),
      ]);

      // ✅ evento final (por si alguien espera onSuccess)
      window.dispatchEvent(
        new CustomEvent('dictamen:closed', { detail: { dictamenId } })
      );
      window.dispatchEvent(
        new CustomEvent('dictamen:estado_updated', { detail: { dictamenId } })
      );
    },
  });
}
