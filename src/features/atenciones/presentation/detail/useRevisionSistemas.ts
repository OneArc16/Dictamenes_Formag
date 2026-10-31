'use client';

import { useCallback, useState } from 'react';

import type { RevisionSistemasDoc } from '@/features/atenciones/application/revision-sistemas';
import type { RevisionSistemas } from '@/features/atenciones/domain/revision-sistemas';

import { atencionRequest, useAutosave } from './useAutosave';

/** Revisión por sistemas de la atención; al primer guardado deja de ser la heredada. */
export function useRevisionSistemas(citaId: number, initial: RevisionSistemasDoc, editable: boolean) {
  const [origen, setOrigen] = useState({ origen: initial.origen, heredadaDe: initial.heredadaDe });

  const persist = useCallback(
    async (datos: RevisionSistemas) => {
      const saved = await atencionRequest<RevisionSistemasDoc>(
        `/api/atenciones/${citaId}/revision-sistemas`,
        { datos },
        'No se pudo guardar la revisión por sistemas.',
      );
      setOrigen({ origen: saved.origen, heredadaDe: saved.heredadaDe });
    },
    [citaId],
  );
  const { value, update, status, error, flush } = useAutosave({ initial: initial.datos, editable, persist });

  return { datos: value, update, status, error, flush, ...origen };
}
