import { z } from 'zod';

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} no puede superar ${max} caracteres`)
    .optional()
    .default('')
    .transform((value) => value || null);

export const sedeInputSchema = z.object({
  centroMedicoId: z.coerce.number().int('El centro médico es inválido').min(1, 'Selecciona un centro médico'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede superar 100 caracteres'),
  codigoHabilitacion: optionalText(50, 'El código de habilitación'),
  direccion: optionalText(225, 'La dirección'),
  telefono: optionalText(50, 'El teléfono'),
});

export const sedeEstadoSchema = z.object({
  estado: z.union([z.boolean(), z.literal(0), z.literal(1)]).transform((value) => (value === true || value === 1 ? 1 : 0)),
});

export type SedePayload = z.output<typeof sedeInputSchema>;

export function parseSedeInput(input: unknown):
  | { ok: true; data: SedePayload }
  | { ok: false; error: string } {
  const parsed = sedeInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  return { ok: true, data: parsed.data };
}

export function parseSedeEstado(input: unknown):
  | { ok: true; data: { estado: 0 | 1 } }
  | { ok: false; error: string } {
  const parsed = sedeEstadoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'El estado es inválido' };
  return { ok: true, data: { estado: parsed.data.estado as 0 | 1 } };
}
