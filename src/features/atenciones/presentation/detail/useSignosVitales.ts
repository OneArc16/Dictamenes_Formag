'use client';

import { useCallback, useMemo, useState } from 'react';

import type { SignosVitalesToma } from '@/features/atenciones/application/signos-vitales';
import { signosToForm, validateSignos, type SignoKey, type SignosForm } from '@/features/atenciones/domain/signos-vitales';

import { atencionRequest, useAutosave } from './useAutosave';

/** Toma de signos de la atención: se escribe como texto, se valida y solo se guarda si no hay errores. */
export function useSignosVitales(citaId: number, initial: SignosVitalesToma, editable: boolean) {
  const [meta, setMeta] = useState({ tomadoEn: initial.tomadoEn, tomadoPor: initial.tomadoPor });

  const persist = useCallback(
    async (form: SignosForm) => {
      const { values, errors } = validateSignos(form);
      if (Object.keys(errors).length > 0) throw new Error('Corrige los valores marcados para guardar.');
      const saved = await atencionRequest<SignosVitalesToma>(
        `/api/atenciones/${citaId}/signos-vitales`,
        values,
        'No se pudieron guardar los signos vitales.',
      );
      setMeta({ tomadoEn: saved.tomadoEn, tomadoPor: saved.tomadoPor });
    },
    [citaId],
  );
  const { value, update, status, error, flush } = useAutosave({
    initial: signosToForm(initial.values),
    editable,
    persist,
  });
  const validation = useMemo(() => validateSignos(value), [value]);

  const setField = useCallback(
    (key: SignoKey, next: string) => update((current) => ({ ...current, [key]: next })),
    [update],
  );

  return { form: value, ...validation, setField, status, error, flush, ...meta };
}
