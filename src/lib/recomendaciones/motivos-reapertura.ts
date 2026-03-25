import { z } from 'zod';

const estadoBooleanLikeSchema = z
  .union([z.boolean(), z.number(), z.string()])
  .transform((value, ctx) => {
    if (value === true || value === 1 || value === '1' || value === 'true') {
      return true;
    }

    if (value === false || value === 0 || value === '0' || value === 'false') {
      return false;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El estado es inválido',
    });

    return z.NEVER;
  });

function emptyToNull(value: string | null | undefined): string | null {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : null;
}

export const motivoReaperturaInputSchema = z.object({
  codigo: z.string().trim().max(20, 'El código no puede superar 20 caracteres').optional().default(''),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(150, 'El nombre no puede superar 150 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(3000, 'La descripción es demasiado larga')
    .optional()
    .default(''),
  orden: z.coerce.number().int('El orden debe ser un número entero').min(1, 'El orden mínimo es 1').max(9999, 'El orden es demasiado alto'),
  estado: estadoBooleanLikeSchema.default(true),
});

export const motivoReaperturaEstadoSchema = z.object({
  estado: estadoBooleanLikeSchema,
});

export type MotivoReaperturaPayload = {
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  orden: number;
  estado: boolean;
};

export function parseMotivoReaperturaInput(input: unknown):
  | { ok: true; data: MotivoReaperturaPayload }
  | { ok: false; error: string } {
  const parsed = motivoReaperturaInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  const { codigo, nombre, descripcion, orden, estado } = parsed.data;

  return {
    ok: true,
    data: {
      codigo: emptyToNull(codigo)?.toUpperCase() ?? null,
      nombre,
      descripcion: emptyToNull(descripcion),
      orden,
      estado,
    },
  };
}

export function parseMotivoReaperturaEstado(input: unknown):
  | { ok: true; data: { estado: boolean } }
  | { ok: false; error: string } {
  const parsed = motivoReaperturaEstadoSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Estado inválido',
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}
