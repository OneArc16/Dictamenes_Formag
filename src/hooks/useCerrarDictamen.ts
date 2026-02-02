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
    throw new Error(
      `API no devolvió JSON (${res.status}). Ej: ${text.slice(0, 120)}...`
    );
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

    onSuccess: async (_server) => {
      // ✅ 1) Fuerza refresco de queries típicas del dictamen
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen-deficiencias-panel', dictamenId] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId, 'titulo3'] }),
        queryClient.invalidateQueries({ queryKey: ['dictamen', dictamenId, 'sustentacion'] }),
      ]);

      // ✅ 2) Evento global (por si tienes listeners existentes)
      window.dispatchEvent(
        new CustomEvent('dictamen:estado_updated', { detail: { dictamenId } })
      );
    },
  });
}
