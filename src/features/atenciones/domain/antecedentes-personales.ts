import { z } from 'zod';

/**
 * Antecedentes personales del docente. Se guardan como un documento JSON único por docente:
 * el catálogo define los campos, y los que falten en datos antiguos toman su valor por defecto.
 */

export const NO_REFIERE = 'NO REFIERE';
export const TEXT_MAX = 500;
export const DETAIL_MAX = 1000;
export const LONG_TEXT_MAX = 3000;

type ItemDefinition = {
  key: string;
  label: string;
  /** Valor inicial; por defecto NO REFIERE. */
  initial?: string;
  /** Tiene un campo "Detalle" aparte, como en el formulario original. */
  detail?: boolean;
};

export const ANTECEDENTE_GROUPS = [
  {
    id: 'alergias',
    title: 'Alergias',
    items: [
      { key: 'alergicos', label: 'Alérgicos' },
      { key: 'alergias', label: 'Alergias', initial: 'No', detail: true },
    ],
  },
  {
    id: 'patologicos',
    title: 'Patológicos',
    items: [
      { key: 'diabetes', label: 'Diabetes', detail: true },
      { key: 'hipertension', label: 'Hipertensión', detail: true },
      { key: 'cardiopatia', label: 'Cardiopatía', detail: true },
      { key: 'enfermedadCerebrovascular', label: 'Enfermedad cerebrovascular' },
      { key: 'enfermedadVascular', label: 'Enfermedad vascular' },
      { key: 'iccIct', label: 'ICC-ICT' },
      { key: 'icr', label: 'ICR' },
      {
        key: 'complicacionLesionOrganos',
        label: 'Complicación lesión de órganos',
      },
      { key: 'asmaEpoc', label: 'Asma EPOC', detail: true },
      { key: 'cancer', label: 'Cáncer', detail: true },
      { key: 'tbc', label: 'TBC' },
      { key: 'vihSida', label: 'VIH SIDA', detail: true },
      { key: 'obesidad', label: 'Obesidad' },
      { key: 'htaDmEmbarazo', label: 'HTA-DM embarazo' },
    ],
  },
  {
    id: 'farmacologicos',
    title: 'Farmacológicos',
    items: [
      { key: 'anticoagulantes', label: 'Anticoagulantes', detail: true },
      { key: 'bifosfonatos', label: 'Bifosfonatos', detail: true },
      { key: 'corticoides', label: 'Corticoides', detail: true },
      { key: 'inmunosupresores', label: 'Inmunosupresores', detail: true },
    ],
  },
  {
    id: 'quirurgicos',
    title: 'Quirúrgicos y hospitalarios',
    items: [
      { key: 'quirurgicos', label: 'Quirúrgicos' },
      { key: 'hospitalizaciones', label: 'Hospitalizaciones' },
    ],
  },
  {
    id: 'exposiciones',
    title: 'Ocupacionales y tóxicos',
    items: [
      { key: 'ocupacionales', label: 'Ocupacionales' },
      { key: 'toxicos', label: 'Tóxicos' },
      { key: 'exposicionMercurio', label: 'Exposición mercurio' },
    ],
  },
  {
    id: 'psicosociales',
    title: 'Psicosociales',
    items: [
      { key: 'apoyoSocial', label: 'Apoyo social' },
      { key: 'violencia', label: 'Violencia' },
      { key: 'otrosPsicosociales', label: 'Otros psicosociales' },
    ],
  },
  {
    id: 'inmunizaciones',
    title: 'Inmunizaciones',
    items: [{ key: 'vacunacion', label: 'Vacunación' }],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  items: ReadonlyArray<ItemDefinition>;
}>;

type CatalogItem = (typeof ANTECEDENTE_GROUPS)[number]['items'][number];
export type ItemKey = CatalogItem['key'];
export type DetailKey = Extract<CatalogItem, { detail: true }>['key'];

const ITEMS: ReadonlyArray<ItemDefinition> = ANTECEDENTE_GROUPS.flatMap(
  (group): ReadonlyArray<ItemDefinition> => group.items,
);
export const ITEM_KEYS = ITEMS.map((item) => item.key) as ItemKey[];
export const DETAIL_KEYS = ITEMS.filter((item) => item.detail).map((item) => item.key) as DetailKey[];

export type AntecedentesPersonales = {
  items: Record<ItemKey, string>;
  detalles: Record<DetailKey, string>;
  habitos: {
    tabaco: string;
    /** Selección del formulario original; null = sin seleccionar. */
    exfumador: 'SI' | 'NO' | null;
    aniosFumando: number | null;
    cigarrillosDia: number | null;
    alcohol: string;
    cantidadAlcohol: string;
    frecuenciaAlcohol: string;
    spa: string;
    spaCuales: string;
    spaFrecuencia: string;
  };
  otrasMedicaciones: string;
  otrasEnfermedades: string;
  otrosAntecedentes: string;
  /** YYYY-MM-DD */
  fechaAntecedente: string | null;
};

// Los textos se recortan al máximo en lugar de descartarse: el formulario ya limita la longitud.
const text = (max: number, initial = '') =>
  z
    .string()
    .catch(initial)
    .default(initial)
    .transform((value) => value.trim().slice(0, max));

const wholeNumber = (max: number) => z.number().int().min(0).max(max).nullable().catch(null).default(null);

const habitosSchema = z
  .object({
    tabaco: text(TEXT_MAX, 'No'),
    exfumador: z.enum(['SI', 'NO']).nullable().catch(null).default(null),
    aniosFumando: wholeNumber(100),
    cigarrillosDia: wholeNumber(200),
    alcohol: text(TEXT_MAX, 'No'),
    cantidadAlcohol: text(TEXT_MAX),
    frecuenciaAlcohol: text(TEXT_MAX),
    spa: text(TEXT_MAX, 'No'),
    spaCuales: text(TEXT_MAX),
    spaFrecuencia: text(TEXT_MAX),
  })
  // Años fumando y cigarrillos solo aplican a quien fuma o fumó.
  .transform((habitos) => (esFumador(habitos) ? habitos : { ...habitos, aniosFumando: null, cigarrillosDia: null }));

const record = z.record(z.string(), z.unknown()).catch({}).default({});

/** Lectura tolerante: completa con los valores por defecto lo que falte o no sea válido. */
const antecedentesPersonalesSchema = z.object({
  items: record.transform(
    (raw) =>
      Object.fromEntries(
        ITEMS.map((item) => [item.key, text(TEXT_MAX, item.initial ?? NO_REFIERE).parse(raw[item.key])]),
      ) as Record<ItemKey, string>,
  ),
  detalles: record.transform(
    (raw) =>
      Object.fromEntries(DETAIL_KEYS.map((key) => [key, text(DETAIL_MAX).parse(raw[key])])) as Record<
        DetailKey,
        string
      >,
  ),
  habitos: z.unknown().transform((raw) => habitosSchema.parse(typeof raw === 'object' && raw ? raw : {})),
  otrasMedicaciones: text(LONG_TEXT_MAX),
  otrasEnfermedades: text(LONG_TEXT_MAX),
  otrosAntecedentes: text(LONG_TEXT_MAX),
  fechaAntecedente: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .catch(null)
    .default(null),
});

export function parseAntecedentesPersonales(value: unknown): AntecedentesPersonales {
  return antecedentesPersonalesSchema.parse(typeof value === 'object' && value ? value : {});
}

/** Guardado (personales o familiares): además de los datos, la versión que el usuario editó (evita pisar cambios de otra atención). */
export const saveAntecedentesSchema = z.object({
  expectedVersion: z.number().int().min(0),
  datos: z.object({}).passthrough(),
});

export const DEFAULT_ANTECEDENTES_PERSONALES = parseAntecedentesPersonales({});

/** Fuma (Tabaco distinto de No/NO REFIERE) o es exfumador. */
export function esFumador(habitos: { tabaco: string; exfumador: 'SI' | 'NO' | null }) {
  return refiere(habitos.tabaco) || habitos.exfumador === 'SI';
}

/** Índice paquetes/año = (cigarrillos al día / 20) × años fumando. */
export function indicePaquetesAnio(cigarrillosDia: number | null, aniosFumando: number | null) {
  if (cigarrillosDia == null || aniosFumando == null) return null;
  return Math.round((cigarrillosDia / 20) * aniosFumando * 10) / 10;
}

/** Un antecedente "refiere" cuando tiene algo distinto de vacío, NO REFIERE o No. */
export function refiere(value: string) {
  const normalized = value.trim().toUpperCase();
  return normalized !== '' && normalized !== NO_REFIERE && normalized !== 'NO';
}

export function countRefiere(antecedentes: AntecedentesPersonales) {
  return ITEM_KEYS.filter((key) => refiere(antecedentes.items[key])).length;
}
