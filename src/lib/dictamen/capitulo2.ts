// src/lib/dictamen/capitulo2.ts

export type ProcedimientoPcl = 'A' | 'B';

export type ClaseLimitacionLaboral = 'I' | 'II' | 'III' | 'IV';

export const CLASES_CAP2: Array<{
  clase: ClaseLimitacionLaboral;
  label: string;
  A: number;
  B: number;
}> = [
  { clase: 'I', label: 'No hay dificultad o dificultad leve', A: 0, B: 0 },
  { clase: 'II', label: 'Dificultad moderada', A: 10, B: 15 },
  { clase: 'III', label: 'Dificultad severa', A: 18, B: 25 },
  { clase: 'IV', label: 'Dificultad completa', A: 25, B: 35 },
];

export function getTotalCap2(
  procedimiento: ProcedimientoPcl,
  clase: ClaseLimitacionLaboral | null | undefined,
): number | null {
  if (!clase) return null;
  const row = CLASES_CAP2.find((r) => r.clase === clase);
  if (!row) return null;
  return procedimiento === 'A' ? row.A : row.B;
}

// Útil por si te llega "i", " Ii " etc desde UI o DB
export function normalizeClaseCap2(
  value: string | null | undefined,
): ClaseLimitacionLaboral | null {
  const v = (value ?? '').trim().toUpperCase();
  if (v === 'I' || v === 'II' || v === 'III' || v === 'IV') return v;
  return null;
}
