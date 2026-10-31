import { z } from 'zod';

export const REMISION_MOTIVO_MAX = 2000;

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
  })
  .strict()
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
  fecha: string;
  medicoNombre: string | null;
};

export type RemisionAtajo = { cupsCodigo: string; etiqueta: string; cupsNombre: string };

/** Estado de cada atajo: verde si ya se cargó en esta atención, amarillo si no. */
export function estadoAtajos(atajos: RemisionAtajo[], remisiones: Pick<Remision, 'cups'>[]) {
  const cargados = new Set(remisiones.map((remision) => remision.cups.codigo));
  return atajos.map((atajo) => ({ ...atajo, cargado: cargados.has(atajo.cupsCodigo) }));
}
