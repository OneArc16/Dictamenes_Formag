import { z } from 'zod';

/** Tipos de diagnóstico, los mismos de Dictámenes (enum TipoDiagnostico). */
export const TIPOS_DIAGNOSTICO = [
  { value: 'IMPRESION_DIAGNOSTICA', label: 'Impresión diagnóstica' },
  { value: 'CONFIRMADO_NUEVO', label: 'Confirmado nuevo' },
  { value: 'CONFIRMADO_REPETIDO', label: 'Confirmado repetido' },
] as const;

export type TipoDiagnostico = (typeof TIPOS_DIAGNOSTICO)[number]['value'];

export const MAX_DIAGNOSTICOS = 10;
/** Filas vacías con las que inicia la pestaña: el principal y dos relacionados. */
export const FILAS_INICIALES = 3;

export type DiagnosticoAtencion = { cie10Codigo: string; cie10Label: string; tipo: TipoDiagnostico };
/** Fila de la pantalla: puede estar vacía mientras se busca el código. */
export type DiagnosticoFila = { id: string; cie10Codigo: string; cie10Label: string; tipo: TipoDiagnostico };

export const saveDiagnosticosSchema = z
  .object({
    diagnosticos: z
      .array(
        z.object({
          cie10Codigo: z.string().trim().min(1).max(10),
          tipo: z.enum(TIPOS_DIAGNOSTICO.map((item) => item.value) as [TipoDiagnostico, ...TipoDiagnostico[]]),
        }),
      )
      .max(MAX_DIAGNOSTICOS, `Máximo ${MAX_DIAGNOSTICOS} diagnósticos.`)
      .refine(
        (items) => new Set(items.map((item) => item.cie10Codigo.toUpperCase())).size === items.length,
        'Hay diagnósticos repetidos.',
      ),
  })
  .strict();

/** Lo que se guarda: las filas con código, en su orden; la primera es el diagnóstico principal. */
export function diagnosticosParaGuardar(filas: DiagnosticoFila[]) {
  return filas
    .filter((fila) => fila.cie10Codigo.trim())
    .map((fila) => ({ cie10Codigo: fila.cie10Codigo.trim(), tipo: fila.tipo }));
}

/** Códigos que aparecen más de una vez (se marcan en pantalla y no se guardan así). */
export function codigosRepetidos(filas: DiagnosticoFila[]) {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const fila of filas) {
    const codigo = fila.cie10Codigo.trim().toUpperCase();
    if (!codigo) continue;
    if (vistos.has(codigo)) repetidos.add(codigo);
    vistos.add(codigo);
  }
  return repetidos;
}

let filaSeq = 0;
export function filaVacia(): DiagnosticoFila {
  filaSeq += 1;
  return { id: `dx-${Date.now()}-${filaSeq}`, cie10Codigo: '', cie10Label: '', tipo: 'IMPRESION_DIAGNOSTICA' };
}

/** Filas iniciales: las guardadas o, si no hay, el principal y dos relacionados vacíos. */
export function filasIniciales(guardados: DiagnosticoAtencion[]): DiagnosticoFila[] {
  if (guardados.length === 0) return Array.from({ length: FILAS_INICIALES }, filaVacia);
  return guardados.map((dx) => ({ ...filaVacia(), ...dx }));
}
