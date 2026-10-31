'use client';

import { useCallback, useState } from 'react';

import type { HallazgoTipo, HallazgosDoc } from '@/features/atenciones/application/hallazgos';
import type { Hallazgos } from '@/features/atenciones/domain/hallazgos';

import { atencionRequest, useAutosave } from './useAutosave';

/** Revisión por sistemas o examen físico de la atención; al primer guardado deja de ser el heredado. */
export function useHallazgos(tipo: HallazgoTipo, citaId: number, initial: HallazgosDoc, editable: boolean) {
  const [origen, setOrigen] = useState({ origen: initial.origen, heredadaDe: initial.heredadaDe });

  const persist = useCallback(
    async (datos: Hallazgos) => {
      const saved = await atencionRequest<HallazgosDoc>(
        `/api/atenciones/${citaId}/hallazgos/${tipo}`,
        { datos },
        'No se pudieron guardar los cambios.',
      );
      setOrigen({ origen: saved.origen, heredadaDe: saved.heredadaDe });
    },
    [citaId, tipo],
  );
  const { value, update, status, error, flush } = useAutosave({ initial: initial.datos, editable, persist });

  return { datos: value, update, status, error, flush, ...origen };
}
