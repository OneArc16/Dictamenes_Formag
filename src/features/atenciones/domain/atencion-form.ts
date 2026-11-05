import { z } from 'zod';

/** Campos de texto propios de la atención (columnas de atenciones), en el orden de sus pestañas. */
export const ATENCION_FIELDS = ['motivoConsulta', 'enfermedadActual', 'analisis', 'plan', 'tratamiento'] as const;

export type AtencionField = (typeof ATENCION_FIELDS)[number];
export type AtencionForm = Record<AtencionField, string>;

export const EMPTY_ATENCION_FORM = Object.fromEntries(ATENCION_FIELDS.map((field) => [field, ''])) as AtencionForm;

/** Para seleccionar con Prisma todos los campos de texto de la atención. */
export const ATENCION_FORM_SELECT = Object.fromEntries(ATENCION_FIELDS.map((field) => [field, true])) as Record<
  AtencionField,
  true
>;

export function atencionFormFromRecord(record: Partial<Record<AtencionField, string | null>> | null | undefined) {
  return Object.fromEntries(ATENCION_FIELDS.map((field) => [field, record?.[field] ?? ''])) as AtencionForm;
}

// No length cap: columns are Postgres text and physicians write long histories.
const text = z.string();

/** Guardado parcial: cada pestaña envía solo sus campos. */
export const saveAtencionSchema = z
  .object(
    Object.fromEntries(ATENCION_FIELDS.map((field) => [field, text.optional()])) as Record<
      AtencionField,
      z.ZodOptional<typeof text>
    >,
  )
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'No hay cambios para guardar.');

export type AtencionPendiente = { field: AtencionField; label: string };

const REQUIRED_FIELDS: AtencionPendiente[] = [
  { field: 'enfermedadActual', label: 'Enfermedad actual' },
  { field: 'tratamiento', label: 'Tratamiento' },
];

/** Campos obligatorios que faltan para poder finalizar la atención. */
export function atencionPendientes(form: AtencionForm): AtencionPendiente[] {
  return REQUIRED_FIELDS.filter(({ field }) => !form[field].trim());
}
