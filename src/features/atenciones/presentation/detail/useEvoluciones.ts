'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import type { CreateEvolucionCommand, Evolucion } from '@/features/atenciones/domain/evoluciones';

async function evolucionRequest<T>(url: string, init: RequestInit, fallback: string): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(data?.message ?? fallback);
  return data.data as T;
}

/** Evoluciones de la atención: cada una se guarda o se quita de inmediato (no hay borrador). */
export function useEvoluciones(citaId: number, initial: Evolucion[]) {
  const [evoluciones, setEvoluciones] = useState(initial);

  const agregar = useMutation({
    mutationFn: (input: CreateEvolucionCommand) =>
      evolucionRequest<Evolucion>(
        `/api/atenciones/${citaId}/evoluciones`,
        { method: 'POST', body: JSON.stringify(input) },
        'No se pudo guardar la evolución.',
      ),
    onSuccess: (evolucion) => {
      setEvoluciones((current) => [...current, evolucion]);
      toast.success('Evolución guardada.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const quitar = useMutation({
    mutationFn: (evolucionId: number) =>
      evolucionRequest<{ id: number }>(
        `/api/atenciones/${citaId}/evoluciones/${evolucionId}`,
        { method: 'DELETE' },
        'No se pudo quitar la evolución.',
      ),
    onSuccess: ({ id }) => setEvoluciones((current) => current.filter((evolucion) => evolucion.id !== id)),
    onError: (error: Error) => toast.error(error.message),
  });

  return { evoluciones, agregar, quitar };
}
