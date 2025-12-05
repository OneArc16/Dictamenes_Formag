'use client';

import { useDictamenDraft } from './useDictamenDraft';

export type TipoDiagnosticoLocal =
  | 'CONFIRMADO_NUEVO'
  | 'IMPRESION_DIAGNOSTICA'
  | 'CONFIRMADO_REPETIDO';

export type DiagnosticoRowDraft = {
  id: string;                // para usar como key en la UI
  cie10Codigo?: string;      // ej: "M54.5"
  cie10Label?: string;       // ej: "M54.5 - LUMBAGO"
  tipo: TipoDiagnosticoLocal;
};

export type DiagnosticosDraftState = {
  diagnosticos: DiagnosticoRowDraft[];
};

// El draft de diagnósticos arranca vacío; los 5 combos por defecto
// los montamos luego en el componente de la pestaña.
const INITIAL_DIAGNOSTICOS_STATE: DiagnosticosDraftState = {
  diagnosticos: [],
};

export function useDiagnosticosDraft(dictamenId: number | null) {
  const {
    draft,
    setDraft,
    updateField,
    loaded,
    saving,
    clearDraft,
  } = useDictamenDraft<DiagnosticosDraftState>({
    dictamenId,
    initialData: INITIAL_DIAGNOSTICOS_STATE,
  });

  const diagnosticos = draft.diagnosticos ?? [];

  const setDiagnosticos = (rows: DiagnosticoRowDraft[]) => {
    // Podemos usar updateField para mantener la API del hook padre
    updateField('diagnosticos', rows);
  };

  return {
    diagnosticos,
    setDiagnosticos,
    loaded,
    saving,
    clearDraft, // este limpia TODO el borrador del dictamen (todas las pestañas)
  };
}
