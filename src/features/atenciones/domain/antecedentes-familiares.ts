import { z } from 'zod';

import { LONG_TEXT_MAX, NO_REFIERE, refiere } from './antecedentes-personales';

/**
 * Antecedentes familiares del docente: campos de texto libre que inician en NO REFIERE.
 * Igual que los personales, se guardan como un documento JSON único por docente.
 */

export const FAMILIAR_TEXT_MAX = LONG_TEXT_MAX;

type FamiliarItem = { key: string; label: string; /** Texto largo (área de texto). */ multiline?: boolean };

export const FAMILIAR_GROUPS = [
  {
    id: 'generales',
    title: 'Generales',
    items: [
      { key: 'generales', label: 'Generales', multiline: true },
      { key: 'patologicos', label: 'Patológicos', multiline: true },
      { key: 'toxicos', label: 'Tóxicos', multiline: true },
      { key: 'psicosociales', label: 'Antecedentes psicosociales', multiline: true },
    ],
  },
  {
    id: 'enfermedades',
    title: 'Enfermedades',
    items: [
      { key: 'diabetes', label: 'Diabetes familiar' },
      { key: 'hipertension', label: 'Hipertensión familiar' },
      { key: 'cardiopatias', label: 'Cardiopatías familiar' },
      { key: 'asma', label: 'Asma familiar' },
      { key: 'obesidad', label: 'Obesidad' },
      { key: 'osteoporosis', label: 'Osteoporosis familiar' },
      { key: 'alergicos', label: 'Alérgicos' },
      { key: 'psicologicos', label: 'Psicológicos' },
    ],
  },
  {
    id: 'oncologicos',
    title: 'Oncológicos',
    items: [
      { key: 'oncologicos', label: 'Oncológicos' },
      { key: 'cancer', label: 'Cáncer familiar' },
      { key: 'cancerPulmon', label: 'Cáncer de pulmón' },
    ],
  },
  {
    id: 'otros-antecedentes',
    title: 'Quirúrgicos, obstétricos y otros',
    items: [
      { key: 'quirurgicos', label: 'Quirúrgicos' },
      { key: 'transfusionales', label: 'Transfusionales' },
      { key: 'obstetricos', label: 'Obstétricos' },
      { key: 'odontologicos', label: 'Odontológicos familiares' },
      { key: 'otrasEnfermedades', label: 'Otras enfermedades familiar', multiline: true },
      { key: 'otrosAntecedentes', label: 'Otros antecedentes familiares', multiline: true },
    ],
  },
] as const satisfies ReadonlyArray<{ id: string; title: string; items: ReadonlyArray<FamiliarItem> }>;

export type FamiliarKey = (typeof FAMILIAR_GROUPS)[number]['items'][number]['key'];

export const FAMILIAR_KEYS = FAMILIAR_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key),
) as FamiliarKey[];

export type AntecedentesFamiliares = {
  items: Record<FamiliarKey, string>;
  /** YYYY-MM-DD */
  fechaAntecedente: string | null;
};

const text = z
  .string()
  .catch(NO_REFIERE)
  .default(NO_REFIERE)
  .transform((value) => value.trim().slice(0, FAMILIAR_TEXT_MAX));

const schema = z.object({
  items: z
    .record(z.string(), z.unknown())
    .catch({})
    .default({})
    .transform(
      (raw) => Object.fromEntries(FAMILIAR_KEYS.map((key) => [key, text.parse(raw[key])])) as Record<FamiliarKey, string>,
    ),
  fechaAntecedente: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .catch(null)
    .default(null),
});

/** Lectura tolerante: completa con NO REFIERE lo que falte o no sea texto. */
export function parseAntecedentesFamiliares(value: unknown): AntecedentesFamiliares {
  return schema.parse(typeof value === 'object' && value ? value : {});
}

export const DEFAULT_ANTECEDENTES_FAMILIARES = parseAntecedentesFamiliares({});

export function countRefiereFamiliares(antecedentes: AntecedentesFamiliares) {
  return FAMILIAR_KEYS.filter((key) => refiere(antecedentes.items[key])).length;
}
