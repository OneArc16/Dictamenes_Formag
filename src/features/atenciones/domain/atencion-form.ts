import { z } from 'zod';

export const ATENCION_TEXT_MAX = 5000;

export type AtencionForm = {
  motivoConsulta: string;
  enfermedadActual: string;
};

export const EMPTY_ATENCION_FORM: AtencionForm = { motivoConsulta: '', enfermedadActual: '' };

const text = z.string().max(ATENCION_TEXT_MAX, `Máximo ${ATENCION_TEXT_MAX.toLocaleString('es-CO')} caracteres.`);

/** Guardado parcial: cada pestaña envía solo sus campos. */
export const saveAtencionSchema = z
  .object({ motivoConsulta: text.optional(), enfermedadActual: text.optional() })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'No hay cambios para guardar.');

export type AtencionPendiente = { field: keyof AtencionForm; label: string };

const REQUIRED_FIELDS: AtencionPendiente[] = [{ field: 'enfermedadActual', label: 'Enfermedad actual' }];

/** Campos obligatorios que faltan para poder finalizar la atención. */
export function atencionPendientes(form: AtencionForm): AtencionPendiente[] {
  return REQUIRED_FIELDS.filter(({ field }) => !form[field].trim());
}
