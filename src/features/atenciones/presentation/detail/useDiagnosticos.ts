'use client';

import { useCallback } from 'react';

import {
  codigosRepetidos,
  diagnosticosParaGuardar,
  filasIniciales,
  type DiagnosticoAtencion,
  type DiagnosticoFila,
} from '@/features/atenciones/domain/diagnosticos';

import { atencionRequest, useAutosave } from './useAutosave';

/** Filas de diagnósticos de la atención; se guardan solas salvo que haya códigos repetidos. */
export function useDiagnosticos(citaId: number, initial: DiagnosticoAtencion[], editable: boolean) {
  const persist = useCallback(
    async (filas: DiagnosticoFila[]) => {
      if (codigosRepetidos(filas).size > 0)
        throw new Error('Hay diagnósticos repetidos: quita el duplicado para guardar.');
      await atencionRequest(
        `/api/atenciones/${citaId}/diagnosticos`,
        { diagnosticos: diagnosticosParaGuardar(filas) },
        'No se pudieron guardar los diagnósticos.',
      );
    },
    [citaId],
  );
  const { value, update, status, error, flush } = useAutosave({ initial: filasIniciales(initial), editable, persist });
  return { filas: value, update, status, error, flush };
}
