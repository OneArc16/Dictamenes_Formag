import { z } from 'zod';

export const REMISION_MOTIVO_MAX = 2000;

/** Participación en junta médica por medicina especializada: abre un caso en el panel de Dictamen. */
export const CUPS_JUNTA_MEDICA = '890502';

export const TIPOS_JUNTA = [
  { value: 'CALIFICACION', label: 'Primera vez' },
  { value: 'RECALIFICACION', label: 'Recalificación' },
] as const;

export type TipoJunta = (typeof TIPOS_JUNTA)[number]['value'];

export function esJuntaMedica(cupsCodigo: string) {
  return cupsCodigo.trim().toUpperCase() === CUPS_JUNTA_MEDICA;
}

export function tipoJuntaLabel(tipo: TipoJunta) {
  return TIPOS_JUNTA.find((item) => item.value === tipo)?.label ?? tipo;
}

const codigo = z
  .string()
  .trim()
  .min(1)
  .max(10)
  .transform((value) => value.toUpperCase());

export const createRemisionSchema = z
  .object({
    cupsCodigo: codigo,
    diagnosticoCodigo: codigo,
    relacionado2Codigo: codigo.nullable().optional(),
    relacionado3Codigo: codigo.nullable().optional(),
    motivo: z.string().trim().max(REMISION_MOTIVO_MAX).optional(),
    tipoDictamen: z.enum(['CALIFICACION', 'RECALIFICACION']).optional(),
  })
  .strict()
  .refine((value) => (esJuntaMedica(value.cupsCodigo) ? value.tipoDictamen !== undefined : value.tipoDictamen === undefined), {
    message: 'Indica si la junta médica es primera vez o recalificación.',
    path: ['tipoDictamen'],
  })
  .refine((value) => {
    const codigos = [value.diagnosticoCodigo, value.relacionado2Codigo, value.relacionado3Codigo].filter(Boolean);
    return new Set(codigos).size === codigos.length;
  }, 'Un mismo diagnóstico no puede repetirse en la remisión.');

export type CreateRemisionCommand = z.infer<typeof createRemisionSchema>;

export type Remision = {
  id: number;
  citaId: number;
  cups: { codigo: string; nombre: string };
  diagnosticos: Array<{ codigo: string; nombre: string }>;
  motivo: string | null;
  /** Solo en la junta médica: primera vez o recalificación, y el caso que abrió en Dictamen. */
  tipoDictamen: TipoJunta | null;
  dictamenId: number | null;
  fecha: string;
  medicoNombre: string | null;
};

/** Remisión recién creada; en junta médica dice si abrió el caso en Dictamen o por qué no. */
export type RemisionCreada = Remision & { aviso: string | null };

export type RemisionAtajo = { cupsCodigo: string; etiqueta: string; cupsNombre: string };

/** Estado de cada atajo: verde si ya se cargó en esta atención, amarillo si no. */
export function estadoAtajos(atajos: RemisionAtajo[], remisiones: Pick<Remision, 'cups'>[]) {
  const cargados = new Set(remisiones.map((remision) => remision.cups.codigo));
  return atajos.map((atajo) => ({ ...atajo, cargado: cargados.has(atajo.cupsCodigo) }));
}

type TipoDiagnosticoCaso = 'CONFIRMADO_NUEVO' | 'IMPRESION_DIAGNOSTICA' | 'CONFIRMADO_REPETIDO';

export type DiagnosticoCaso = {
  cie10Codigo: string;
  tipo: TipoDiagnosticoCaso;
  esPrincipal: boolean;
  orden: number;
};

/**
 * Diagnoses a junta case starts with: the remission's principal and related codes, in that
 * order and without repeats. Each keeps the type recorded in the attention when present.
 */
export function diagnosticosCasoJunta(
  codigosRemision: Array<string | null | undefined>,
  diagnosticosAtencion: Array<{ cie10Codigo: string; tipo: TipoDiagnosticoCaso }>,
): DiagnosticoCaso[] {
  const tipos = new Map(diagnosticosAtencion.map((diagnostico) => [diagnostico.cie10Codigo, diagnostico.tipo]));
  const codigos = [...new Set(codigosRemision.filter((codigo): codigo is string => Boolean(codigo)))];
  return codigos.map((cie10Codigo, index) => ({
    cie10Codigo,
    tipo: tipos.get(cie10Codigo) ?? 'IMPRESION_DIAGNOSTICA',
    esPrincipal: index === 0,
    orden: index + 1,
  }));
}
