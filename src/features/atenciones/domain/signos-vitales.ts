import { z } from 'zod';

/**
 * Signos vitales de una atención. Los rangos min/max son los valores que se aceptan al guardar
 * (descartan errores de digitación); las alertas marcan lo que se sale de lo normal en adultos.
 */

type SignoField = {
  key: string;
  label: string;
  short: string;
  unit: string;
  min: number;
  max: number;
  decimals: number;
  required: boolean;
  group: 'signos' | 'antropometria' | 'perimetros';
};

export const SIGNO_FIELDS = [
  {
    key: 'presionSistolica',
    label: 'Presión sistólica',
    short: 'Sistólica',
    unit: 'mmHg',
    min: 50,
    max: 300,
    decimals: 0,
    required: true,
    group: 'signos',
  },
  {
    key: 'presionDiastolica',
    label: 'Presión diastólica',
    short: 'Diastólica',
    unit: 'mmHg',
    min: 20,
    max: 200,
    decimals: 0,
    required: true,
    group: 'signos',
  },
  {
    key: 'frecuenciaCardiaca',
    label: 'Frecuencia cardíaca',
    short: 'FC',
    unit: 'lpm',
    min: 20,
    max: 250,
    decimals: 0,
    required: true,
    group: 'signos',
  },
  {
    key: 'frecuenciaRespiratoria',
    label: 'Frecuencia respiratoria',
    short: 'FR',
    unit: 'rpm',
    min: 4,
    max: 80,
    decimals: 0,
    required: true,
    group: 'signos',
  },
  {
    key: 'temperatura',
    label: 'Temperatura',
    short: 'T°',
    unit: '°C',
    min: 30,
    max: 45,
    decimals: 1,
    required: true,
    group: 'signos',
  },
  {
    key: 'saturacion',
    label: 'Saturación',
    short: 'SpO₂',
    unit: '%',
    min: 50,
    max: 100,
    decimals: 0,
    required: true,
    group: 'signos',
  },
  {
    key: 'pesoKg',
    label: 'Peso',
    short: 'Peso',
    unit: 'kg',
    min: 2,
    max: 400,
    decimals: 2,
    required: true,
    group: 'antropometria',
  },
  {
    key: 'tallaCm',
    label: 'Talla',
    short: 'Talla',
    unit: 'cm',
    min: 40,
    max: 250,
    decimals: 1,
    required: true,
    group: 'antropometria',
  },
  {
    key: 'perimetroCefalico',
    label: 'Perímetro cefálico',
    short: 'Cefálico',
    unit: 'cm',
    min: 20,
    max: 80,
    decimals: 1,
    required: false,
    group: 'perimetros',
  },
  {
    key: 'perimetroBraquial',
    label: 'Perímetro braquial',
    short: 'Braquial',
    unit: 'cm',
    min: 5,
    max: 80,
    decimals: 1,
    required: false,
    group: 'perimetros',
  },
  {
    key: 'perimetroToracico',
    label: 'Perímetro torácico',
    short: 'Torácico',
    unit: 'cm',
    min: 30,
    max: 200,
    decimals: 1,
    required: false,
    group: 'perimetros',
  },
  {
    key: 'perimetroAbdominal',
    label: 'Perímetro abdominal',
    short: 'Abdominal',
    unit: 'cm',
    min: 30,
    max: 250,
    decimals: 1,
    required: false,
    group: 'perimetros',
  },
  {
    key: 'perimetroMuslo',
    label: 'Perímetro muslo',
    short: 'Muslo',
    unit: 'cm',
    min: 10,
    max: 120,
    decimals: 1,
    required: false,
    group: 'perimetros',
  },
] as const satisfies ReadonlyArray<SignoField>;

export type SignoKey = (typeof SIGNO_FIELDS)[number]['key'];
export type SignosValues = Record<SignoKey, number | null>;
/** Lo que hay escrito en pantalla (permite coma decimal y valores a medio escribir). */
export type SignosForm = Record<SignoKey, string>;

export const SIGNO_KEYS = SIGNO_FIELDS.map((field) => field.key) as SignoKey[];
const FIELD_BY_KEY = Object.fromEntries(SIGNO_FIELDS.map((field) => [field.key, field])) as Record<
  SignoKey,
  SignoField
>;

export const EMPTY_SIGNOS: SignosValues = Object.fromEntries(SIGNO_KEYS.map((key) => [key, null])) as SignosValues;

/** Columnas de la tabla (Decimal o número) a valores numéricos; sin registro, todo vacío. */
export function signosFromRecord(record: Partial<Record<SignoKey, unknown>> | null | undefined): SignosValues {
  if (!record) return { ...EMPTY_SIGNOS };
  return Object.fromEntries(
    SIGNO_KEYS.map((key) => [key, record[key] == null ? null : Number(record[key])]),
  ) as SignosValues;
}

/** Para seleccionar con Prisma todas las columnas de signos. */
export const SIGNO_SELECT = Object.fromEntries(SIGNO_KEYS.map((key) => [key, true])) as Record<SignoKey, true>;

export function signosToForm(values: SignosValues): SignosForm {
  return Object.fromEntries(
    SIGNO_KEYS.map((key) => [key, values[key] == null ? '' : String(values[key]).replace('.', ',')]),
  ) as SignosForm;
}

/** Convierte lo escrito a número; '' es vacío y cualquier otra cosa no numérica es inválida. */
export function parseSignoNumber(raw: string): number | null | typeof Number.NaN {
  const normalized = raw.trim().replace(',', '.');
  if (!normalized) return null;
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN;
}

function rangeError(key: SignoKey, value: number) {
  const field = FIELD_BY_KEY[key];
  if (value < field.min || value > field.max) return `Entre ${field.min} y ${field.max} ${field.unit}`;
  const decimals = String(value).split('.')[1]?.length ?? 0;
  if (decimals > field.decimals)
    return field.decimals === 0 ? 'Sin decimales' : `Máximo ${field.decimals} decimal${field.decimals > 1 ? 'es' : ''}`;
  return null;
}

/** Valida lo escrito: devuelve los valores numéricos y los errores por campo. */
export function validateSignos(form: SignosForm) {
  const values = { ...EMPTY_SIGNOS };
  const errors: Partial<Record<SignoKey, string>> = {};
  for (const key of SIGNO_KEYS) {
    const parsed = parseSignoNumber(form[key]);
    if (parsed === null) continue;
    if (Number.isNaN(parsed)) {
      errors[key] = 'Escribe solo números';
      continue;
    }
    const error = rangeError(key, parsed);
    if (error) errors[key] = error;
    else values[key] = parsed;
  }
  if (
    values.presionSistolica != null &&
    values.presionDiastolica != null &&
    values.presionDiastolica >= values.presionSistolica
  ) {
    errors.presionDiastolica = 'Debe ser menor que la sistólica';
    values.presionDiastolica = null;
  }
  return { values, errors };
}

/** Esquema del servidor: los mismos rangos, aplicados a los valores ya numéricos. */
export const signosVitalesSchema = z
  .object(
    Object.fromEntries(SIGNO_KEYS.map((key) => [key, z.number().nullable()])) as Record<
      SignoKey,
      z.ZodNullable<z.ZodNumber>
    >,
  )
  .strict()
  .superRefine((values, ctx) => {
    for (const key of SIGNO_KEYS) {
      const value = values[key];
      const error = value == null ? null : rangeError(key, value);
      if (error)
        ctx.addIssue({ code: 'custom', path: [key], message: `${FIELD_BY_KEY[key].label}: ${error.toLowerCase()}.` });
    }
    if (
      values.presionSistolica != null &&
      values.presionDiastolica != null &&
      values.presionDiastolica >= values.presionSistolica
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['presionDiastolica'],
        message: 'La presión diastólica debe ser menor que la sistólica.',
      });
    }
  });

/** Campos obligatorios sin diligenciar (impiden finalizar la atención). */
export function signosPendientes(values: SignosValues) {
  return SIGNO_FIELDS.filter((field) => field.required && values[field.key] == null);
}

/** IMC = peso (kg) / talla (m)². */
export function calcularImc(pesoKg: number | null, tallaCm: number | null) {
  if (pesoKg == null || tallaCm == null || tallaCm <= 0) return null;
  return Math.round((pesoKg / (tallaCm / 100) ** 2) * 100) / 100;
}

export function clasificarImc(imc: number | null) {
  if (imc == null) return null;
  if (imc < 18.5) return { label: 'Bajo peso', tone: 'warning' as const };
  if (imc < 25) return { label: 'Normal', tone: 'ok' as const };
  if (imc < 30) return { label: 'Sobrepeso', tone: 'warning' as const };
  return { label: 'Obesidad', tone: 'danger' as const };
}

/** Alerta orientativa para un adulto; null si el valor está en lo esperado o no se ha tomado. */
export function alertaSigno(key: SignoKey, values: SignosValues): string | null {
  const value = values[key];
  if (value == null) return null;
  switch (key) {
    case 'presionSistolica':
      return value >= 140 ? 'Alta' : value < 90 ? 'Baja' : null;
    case 'presionDiastolica':
      return value >= 90 ? 'Alta' : value < 60 ? 'Baja' : null;
    case 'frecuenciaCardiaca':
      return value > 100 ? 'Taquicardia' : value < 60 ? 'Bradicardia' : null;
    case 'frecuenciaRespiratoria':
      return value > 20 ? 'Taquipnea' : value < 12 ? 'Bradipnea' : null;
    case 'temperatura':
      return value >= 38 ? 'Fiebre' : value > 37.5 ? 'Febrícula' : value < 35.5 ? 'Hipotermia' : null;
    case 'saturacion':
      return value < 90 ? 'Hipoxemia' : value < 95 ? 'Baja' : null;
    default:
      return null;
  }
}

export function formatSigno(value: number | null) {
  return value == null ? '—' : String(value).replace('.', ',');
}
