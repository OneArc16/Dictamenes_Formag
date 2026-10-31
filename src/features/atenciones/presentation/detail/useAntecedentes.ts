'use client';

import { useCallback, useRef, useState } from 'react';

import type { AntecedenteKind, AntecedentesDoc } from '@/features/atenciones/application/antecedentes';

import { atencionRequest, useAutosave } from './useAutosave';

/** Antecedentes del docente: se guarda el documento completo junto con la versión que se editó. */
export function useAntecedentes<T>(kind: AntecedenteKind, citaId: number, initial: AntecedentesDoc<T>, editable: boolean) {
  const versionRef = useRef(initial.version);
  const [meta, setMeta] = useState({ actualizadoEn: initial.actualizadoEn, actualizadoPor: initial.actualizadoPor });

  const persist = useCallback(
    async (datos: T) => {
      const saved = await atencionRequest<AntecedentesDoc<T>>(
        `/api/atenciones/${citaId}/antecedentes/${kind}`,
        { expectedVersion: versionRef.current, datos },
        'No se pudieron guardar los antecedentes.',
      );
      versionRef.current = saved.version;
      setMeta({ actualizadoEn: saved.actualizadoEn, actualizadoPor: saved.actualizadoPor });
    },
    [citaId, kind],
  );
  const { value, update, status, error, flush } = useAutosave({ initial: initial.datos, editable, persist });

  return { datos: value, update, status, error, flush, ...meta };
}
