import { z } from 'zod';

import { parseDateOnly } from '@/features/agenda/domain/date-time';

export const CATEGORIAS_INCAPACIDAD = [
  { value: 'ENFERMEDAD_GENERAL', label: 'Enfermedad general' },
  { value: 'ENFERMEDAD_PROFESIONAL', label: 'Enfermedad profesional' },
  { value: 'ACCIDENTE_LABORAL', label: 'Accidente laboral' },
  { value: 'ACCIDENTE_NO_LABORAL', label: 'Accidente no laboral' },
  { value: 'INCAPACIDAD_MATERNA', label: 'Incapacidad materna' },
  { value: 'LEY_MARIA', label: 'Ley María' },
] as const;

export type CategoriaIncapacidad = (typeof CATEGORIAS_INCAPACIDAD)[number]['value'];

const CATEGORIA_VALUES = CATEGORIAS_INCAPACIDAD.map((item) => item.value) as [
  CategoriaIncapacidad,
  ...CategoriaIncapacidad[],
];

export function categoriaLabel(categoria: CategoriaIncapacidad) {
  return CATEGORIAS_INCAPACIDAD.find((item) => item.value === categoria)?.label ?? categoria;
}

export const INCAPACIDAD_DIAS_MAX = 180;
export const INCAPACIDAD_OBSERVACIONES_MAX = 2000;

export const createIncapacidadSchema = z
  .object({
    categoria: z.enum(CATEGORIA_VALUES, { error: 'Selecciona la categoría.' }),
    prorroga: z.boolean(),
    fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de inicio no es válida.'),
    dias: z
      .number({ error: 'Escribe los días de incapacidad.' })
      .int('Los días deben ser un número entero.')
      .min(1, 'La incapacidad debe tener al menos 1 día.')
      .max(INCAPACIDAD_DIAS_MAX, `La incapacidad admite máximo ${INCAPACIDAD_DIAS_MAX} días.`),
    observaciones: z.string().trim().max(INCAPACIDAD_OBSERVACIONES_MAX).optional(),
  })
  .strict();

export type CreateIncapacidadCommand = z.infer<typeof createIncapacidadSchema>;

export type Incapacidad = {
  id: number;
  citaId: number;
  numeroInterno: string;
  categoria: CategoriaIncapacidad;
  prorroga: boolean;
  /** Diagnósticos de la atención en que se expidió; el primero es el principal. */
  diagnosticos: Array<{ codigo: string; nombre: string }>;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  observaciones: string | null;
  fecha: string;
  medicoNombre: string | null;
};

function addDays(date: string, days: number) {
  const value = parseDateOnly(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/** El día de inicio cuenta como primer día de incapacidad. */
export function fechaFinIncapacidad(fechaInicio: string, dias: number) {
  return addDays(fechaInicio, dias - 1);
}

type Rango = { fechaInicio: string; fechaFin: string };

export function incapacidadesSeCruzan(a: Rango, b: Rango) {
  return a.fechaInicio <= b.fechaFin && b.fechaInicio <= a.fechaFin;
}

export function formatNumeroInterno(anio: number, consecutivo: number) {
  return `${anio}-${String(consecutivo).padStart(4, '0')}`;
}

export function totalDias(incapacidades: Array<{ dias: number }>) {
  return incapacidades.reduce((total, item) => total + item.dias, 0);
}
