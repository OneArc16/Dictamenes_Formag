import type { SoporteRow } from './types';

export const FIXED_SUPPORTS: Array<{ type: SoporteRow['tipo']; label: string }> = [
  { type: 'REPORTE_ACCIDENTE_TRABAJO', label: 'Reporte de Accidente de Trabajo' },
  { type: 'DESCRIPCION_EVENTO', label: 'Descripción del Evento Ocurrido' },
  { type: 'EPICRISIS_RESUMEN_HISTORIA', label: 'Epicrisis o Resumen de Historia Clínica' },
  { type: 'CERTIFICADO_DEFUNCION', label: 'Certificado de Defunción' },
  { type: 'ANALISIS_PUESTO_TRABAJO', label: 'Análisis de Puesto de Trabajo' },
  { type: 'EXAMENES_PREOCUPACIONALES', label: 'Exámenes Preocupacionales' },
  { type: 'INVESTIGACION_ACCIDENTE', label: 'Investigación del Accidente Realizada' },
];

/**
 * Once the physician filled at least one fixed support, the fixed supports left untouched
 * are saved as N.A. "Otros" is optional and never auto-filled.
 */
export function withUnfilledSupportsAsNotApplicable(supports: SoporteRow[]): SoporteRow[] {
  const filledTypes = new Set(supports.map((support) => support.tipo));
  const anyFixedFilled = FIXED_SUPPORTS.some(({ type }) => filledTypes.has(type));
  if (!anyFixedFilled) return supports;
  const missing = FIXED_SUPPORTS.filter(({ type }) => !filledTypes.has(type)).map(({ type }, index) => ({
    id: -(index + 1),
    tipo: type,
    estado: 'NO_APLICA' as const,
    fechaDocumento: null,
    seTuvoEnCuenta: null,
    nombreOtro: null,
  }));
  return [...supports, ...missing];
}
