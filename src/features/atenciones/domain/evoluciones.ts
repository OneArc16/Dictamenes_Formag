import { z } from 'zod';

export const EVOLUCION_TEXTO_MAX = 5000;

export const createEvolucionSchema = z
  .object({
    texto: z
      .string({ error: 'Escribe la evolución.' })
      .trim()
      .min(1, 'Escribe la evolución.')
      .max(EVOLUCION_TEXTO_MAX, `La evolución admite máximo ${EVOLUCION_TEXTO_MAX} caracteres.`),
  })
  .strict();

export type CreateEvolucionCommand = z.infer<typeof createEvolucionSchema>;

/** Nota de evolución del docente: fecha, médico que la escribió y texto. */
export type Evolucion = {
  id: number;
  citaId: number;
  texto: string;
  fecha: string;
  medicoNombre: string | null;
};
