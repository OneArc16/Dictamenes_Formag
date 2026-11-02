import { z } from 'zod';

/**
 * Copia de la identificación del paciente, del médico que atendió y de la sede, guardada al
 * finalizar la atención: la historia conserva los datos con los que se firmó aunque después
 * cambien (EPS, dirección, firma…). Las atenciones finalizadas antes de existir no la tienen.
 */

const texto = z.string().nullable();

export const datosRegistroSchema = z.object({
  version: z.literal(1),
  paciente: z.object({
    nombreCompleto: z.string(),
    tipoDocumento: z.string(),
    documento: z.string(),
    /** YYYY-MM-DD */
    fechaNacimiento: texto,
    /** La edad guardada en el registro del docente; solo se usa sin fecha de nacimiento. */
    edad: z.number().int().nullable(),
    sexo: z.string(),
    estadoCivil: texto,
    direccion: texto,
    telefono: texto,
    eps: texto,
    cargo: texto,
    secretaria: texto,
    institucion: texto,
    etnia: texto,
    zonaResidencia: texto,
  }),
  profesional: z.object({
    nombre: z.string(),
    tipoDocumento: texto,
    documento: texto,
    registroMedico: texto,
    licencia: texto,
    /** Firma como data URL. */
    firmaSrc: texto,
  }),
  sede: z.object({
    codigoHabilitacion: texto,
    direccion: texto,
    telefono: texto,
    ciudad: texto,
  }),
});

export type DatosRegistro = z.infer<typeof datosRegistroSchema>;

/** La copia guardada, o null si no hay o no es válida (entonces se leen los datos actuales). */
export function parseDatosRegistro(value: unknown): DatosRegistro | null {
  const parsed = datosRegistroSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
