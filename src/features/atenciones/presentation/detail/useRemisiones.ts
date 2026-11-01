'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import {
  tipoJuntaLabel,
  type CreateRemisionCommand,
  type Remision,
  type RemisionCreada,
} from '@/features/atenciones/domain/remisiones';

async function remisionRequest<T>(url: string, init: RequestInit, fallback: string): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(data?.message ?? fallback);
  return data.data as T;
}

/** Remisiones de la atención: cada una se agrega o se quita de inmediato (no hay borrador). */
export function useRemisiones(citaId: number, initial: Remision[]) {
  const [remisiones, setRemisiones] = useState(initial);

  const agregar = useMutation({
    mutationFn: (input: CreateRemisionCommand) =>
      remisionRequest<RemisionCreada>(
        `/api/atenciones/${citaId}/remisiones`,
        { method: 'POST', body: JSON.stringify(input) },
        'No se pudo agregar la remisión.',
      ),
    onSuccess: ({ aviso, ...remision }) => {
      setRemisiones((current) => [...current, remision]);
      if (remision.dictamenId && remision.tipoDictamen) {
        toast.success(
          `Remisión agregada. Se abrió el caso #${remision.dictamenId} (${tipoJuntaLabel(remision.tipoDictamen)}) en tu panel de Dictamen.`,
          { duration: 6000 },
        );
      } else {
        toast.success(`Remisión agregada: ${remision.cups.nombre}`);
      }
      if (aviso) toast(aviso, { icon: '⚠️', duration: 7000 });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const quitar = useMutation({
    mutationFn: (remisionId: number) =>
      remisionRequest<{ id: number }>(
        `/api/atenciones/${citaId}/remisiones/${remisionId}`,
        { method: 'DELETE' },
        'No se pudo quitar la remisión.',
      ),
    onSuccess: ({ id }) => setRemisiones((current) => current.filter((remision) => remision.id !== id)),
    onError: (error: Error) => toast.error(error.message),
  });

  return { remisiones, agregar, quitar };
}
