'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import type { CreateIncapacidadCommand, Incapacidad } from '@/features/atenciones/domain/incapacidades';

async function incapacidadRequest<T>(url: string, init: RequestInit, fallback: string): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(data?.message ?? fallback);
  return data.data as T;
}

/** Incapacidades de la atención: cada una se expide o se quita de inmediato (no hay borrador). */
export function useIncapacidades(citaId: number, initial: Incapacidad[]) {
  const [incapacidades, setIncapacidades] = useState(initial);

  const agregar = useMutation({
    mutationFn: (input: CreateIncapacidadCommand) =>
      incapacidadRequest<Incapacidad>(
        `/api/atenciones/${citaId}/incapacidades`,
        { method: 'POST', body: JSON.stringify(input) },
        'No se pudo expedir la incapacidad.',
      ),
    onSuccess: (incapacidad) => {
      setIncapacidades((current) => [...current, incapacidad]);
      toast.success(`Incapacidad ${incapacidad.numeroInterno} expedida.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const quitar = useMutation({
    mutationFn: (incapacidadId: number) =>
      incapacidadRequest<{ id: number }>(
        `/api/atenciones/${citaId}/incapacidades/${incapacidadId}`,
        { method: 'DELETE' },
        'No se pudo quitar la incapacidad.',
      ),
    onSuccess: ({ id }) => setIncapacidades((current) => current.filter((incapacidad) => incapacidad.id !== id)),
    onError: (error: Error) => toast.error(error.message),
  });

  return { incapacidades, agregar, quitar };
}
