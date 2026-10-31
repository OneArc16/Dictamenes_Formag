import { z } from 'zod';

import { LONG_TEXT_MAX, NO_REFIERE, TEXT_MAX, refiere } from './antecedentes-personales';

/**
 * Antecedentes ginecobstétricos de la docente (solo aplican a mujeres). Igual que los demás
 * antecedentes, son un documento JSON único por docente compartido entre sus atenciones.
 */

/** Fórmula obstétrica: conteos, vacíos hasta que se diligencian. */
export const FORMULA_FIELDS = [
  { key: 'gesta', label: 'G', title: 'Gesta' },
  { key: 'partos', label: 'P', title: 'Partos' },
  { key: 'cesareas', label: 'C', title: 'Cesáreas' },
  { key: 'abortos', label: 'A', title: 'Abortos' },
  { key: 'ectopicos', label: 'E', title: 'Ectópicos' },
  { key: 'vivos', label: 'V', title: 'Vivos' },
  { key: 'muertos', label: 'M', title: 'Muertos' },
] as const;

type GinecoField =
  | { key: string; label: string; kind: 'text' }
  | { key: string; label: string; kind: 'date' }
  | { key: string; label: string; kind: 'number' }
  | { key: string; label: string; kind: 'textarea' };

export const GINECO_GROUPS = [
  {
    id: 'obstetricos',
    title: 'Obstétricos',
    fields: [
      { key: 'formulaObstetrica', label: 'Fórmula obstétrica', kind: 'text' },
      { key: 'ive', label: 'IVE (interrupción voluntaria del embarazo)', kind: 'text' },
      { key: 'ivo', label: 'IVO (inicio de vida obstétrica)', kind: 'text' },
      { key: 'fup', label: 'FUP (fecha último parto)', kind: 'date' },
      { key: 'fpp', label: 'FPP (fecha probable de parto)', kind: 'date' },
    ],
  },
  {
    id: 'menstruacion',
    title: 'Menstruación',
    fields: [
      { key: 'menarquia', label: 'Menarquia', kind: 'text' },
      { key: 'ciclos', label: 'Ciclos', kind: 'text' },
      { key: 'fum', label: 'FUM (fecha última menstruación)', kind: 'date' },
      { key: 'alteracionesCicloMenstrual', label: 'Alteraciones del ciclo menstrual', kind: 'text' },
      { key: 'trastornosMenstruales', label: 'Trastornos menstruales', kind: 'text' },
      { key: 'tipoTrastornoMenstrual', label: 'Tipo de trastorno menstrual', kind: 'text' },
      { key: 'porAmenorrea', label: 'Por amenorrea', kind: 'text' },
    ],
  },
  {
    id: 'planificacion',
    title: 'Planificación familiar',
    fields: [
      { key: 'planificacionFamiliar', label: 'Planificación familiar', kind: 'text' },
      { key: 'modalidad', label: 'Modalidad', kind: 'text' },
      { key: 'metodo', label: 'Método', kind: 'text' },
      { key: 'confiable', label: 'Confiable', kind: 'text' },
      { key: 'metodosAnticoncepcion', label: 'Métodos de anticoncepción', kind: 'text' },
      { key: 'anticonceptivosPrevios', label: 'Anticonceptivos previos a consulta', kind: 'text' },
      { key: 'prescritoPor', label: 'Prescrito por', kind: 'text' },
      { key: 'tiempoUtilizacion', label: 'Tiempo de utilización', kind: 'text' },
      { key: 'problemasPresentados', label: 'Problemas presentados', kind: 'text' },
      { key: 'otro', label: 'Otro', kind: 'text' },
    ],
  },
  {
    id: 'citologia',
    title: 'Citología',
    fields: [
      { key: 'fechaUltimaCitologia', label: 'Fecha última citología', kind: 'date' },
      { key: 'resultadoCitologia', label: 'Resultado citología', kind: 'text' },
    ],
  },
  {
    id: 'sexualidad',
    title: 'Sexualidad',
    fields: [
      { key: 'ivs', label: 'IVS (inicio de vida sexual)', kind: 'text' },
      { key: 'inicioRelacionesSexuales', label: 'Inicio de relaciones sexuales', kind: 'text' },
      { key: 'companerosSexuales', label: 'Número de compañeros sexuales', kind: 'number' },
      { key: 'orientacionSexual', label: 'Orientación sexual', kind: 'text' },
      { key: 'identidadGenero', label: 'Identidad de género', kind: 'text' },
      {
        key: 'tomaDecisionesSexualidad',
        label: 'Toma de decisiones alrededor de la sexualidad y la reproducción',
        kind: 'text',
      },
      { key: 'dificultadRelacionesSexuales', label: 'Dificultad durante relaciones sexuales', kind: 'text' },
    ],
  },
  {
    id: 'psicosociales',
    title: 'Psicosociales',
    fields: [
      {
        key: 'comportamientosRelaciones',
        label: 'Antecedentes de comportamientos y relaciones interpersonales',
        kind: 'text',
      },
      { key: 'conductaSuicida', label: 'Conducta suicida', kind: 'text' },
      { key: 'formasViolencia', label: 'Diversas formas de violencia', kind: 'text' },
    ],
  },
  {
    id: 'otros',
    title: 'Otros',
    fields: [
      { key: 'antecedentesFarmacologicos', label: 'Antecedentes farmacológicos', kind: 'text' },
      { key: 'fechaAntecedente', label: 'Fecha antecedente', kind: 'date' },
      { key: 'observaciones', label: 'Observaciones', kind: 'textarea' },
    ],
  },
] as const satisfies ReadonlyArray<{ id: string; title: string; fields: ReadonlyArray<GinecoField> }>;

type CatalogField = (typeof GINECO_GROUPS)[number]['fields'][number];
export type GinecoTextKey = Extract<CatalogField, { kind: 'text' }>['key'];
export type GinecoDateKey = Extract<CatalogField, { kind: 'date' }>['key'];
export type GinecoNumberKey = Extract<CatalogField, { kind: 'number' }>['key'] | (typeof FORMULA_FIELDS)[number]['key'];

const FIELDS: ReadonlyArray<GinecoField> = GINECO_GROUPS.flatMap((group): ReadonlyArray<GinecoField> => group.fields);
const keysOf = (kind: GinecoField['kind']) => FIELDS.filter((field) => field.kind === kind).map((field) => field.key);
const TEXT_KEYS = keysOf('text') as GinecoTextKey[];
const DATE_KEYS = keysOf('date') as GinecoDateKey[];
const NUMBER_KEYS = [...FORMULA_FIELDS.map((field) => field.key), ...keysOf('number')] as GinecoNumberKey[];

export type AntecedentesGinecobstetricos = {
  textos: Record<GinecoTextKey, string>;
  numeros: Record<GinecoNumberKey, number | null>;
  /** YYYY-MM-DD */
  fechas: Record<GinecoDateKey, string | null>;
  observaciones: string;
};

const record = z.record(z.string(), z.unknown()).catch({}).default({});
const text = (max: number, initial: string) =>
  z
    .string()
    .catch(initial)
    .default(initial)
    .transform((value) => value.trim().slice(0, max));
const count = (initial: number | null) => z.number().int().min(0).max(99).nullable().catch(initial).default(initial);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .catch(null)
  .default(null);

const schema = z.object({
  textos: record.transform(
    (raw) =>
      Object.fromEntries(TEXT_KEYS.map((key) => [key, text(TEXT_MAX, NO_REFIERE).parse(raw[key])])) as Record<
        GinecoTextKey,
        string
      >,
  ),
  // Compañeros sexuales inicia en 0, como en el formulario original; la fórmula obstétrica, vacía.
  numeros: record.transform(
    (raw) =>
      Object.fromEntries(
        NUMBER_KEYS.map((key) => [key, count(key === 'companerosSexuales' ? 0 : null).parse(raw[key])]),
      ) as Record<GinecoNumberKey, number | null>,
  ),
  fechas: record.transform(
    (raw) =>
      Object.fromEntries(DATE_KEYS.map((key) => [key, date.parse(raw[key])])) as Record<GinecoDateKey, string | null>,
  ),
  observaciones: text(LONG_TEXT_MAX, ''),
});

/** Lectura tolerante: completa con los valores por defecto lo que falte o no sea válido. */
export function parseAntecedentesGinecobstetricos(value: unknown): AntecedentesGinecobstetricos {
  return schema.parse(typeof value === 'object' && value ? value : {});
}

export const DEFAULT_ANTECEDENTES_GINECOBSTETRICOS = parseAntecedentesGinecobstetricos({});

export function countRefiereGineco(antecedentes: AntecedentesGinecobstetricos) {
  return TEXT_KEYS.filter((key) => refiere(antecedentes.textos[key])).length;
}

/** FPP por la regla de Naegele: FUM + 280 días. */
export function fechaProbableParto(fum: string | null) {
  if (!fum) return null;
  const date = new Date(`${fum}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 280);
  return date.toISOString().slice(0, 10);
}

/** El sexo se guarda como 'M' (mujer) o 'H' (hombre); también se acepta 'F'. */
export function esMujer(sexo: string | null | undefined) {
  const normalized = (sexo ?? '').trim().toUpperCase();
  return normalized === 'M' || normalized === 'F';
}
