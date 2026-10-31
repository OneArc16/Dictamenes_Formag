'use client';

import { useCallback } from 'react';

import type { AtencionForm } from '@/features/atenciones/domain/atencion-form';

import { atencionRequest, useAutosave } from './useAutosave';

function changedFields(form: AtencionForm, saved: AtencionForm): Partial<AtencionForm> {
  const patch: Partial<AtencionForm> = {};
  for (const key of Object.keys(form) as Array<keyof AtencionForm>) {
    if (form[key] !== saved[key]) patch[key] = form[key];
  }
  return patch;
}

/** Campos propios de la atención (motivo, enfermedad actual…); se envían solo los que cambiaron. */
export function useAtencionForm(citaId: number, initial: AtencionForm, editable: boolean) {
  const persist = useCallback(
    async (form: AtencionForm, saved: AtencionForm) => {
      await atencionRequest(`/api/atenciones/${citaId}`, changedFields(form, saved), 'No se pudo guardar la atención.');
    },
    [citaId],
  );
  const { value, update, status, error, flush } = useAutosave({ initial, editable, persist });

  const setField = useCallback(
    (field: keyof AtencionForm, next: string) => update((current) => ({ ...current, [field]: next })),
    [update],
  );

  return { form: value, setField, status, error, flush };
}
