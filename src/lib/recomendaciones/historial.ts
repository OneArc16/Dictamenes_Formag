import { type Prisma } from '@prisma/client';

export const recomendacionHistorialFieldLabels = {
  tallaM: 'Talla (m)',
  pesoKg: 'Peso (kg)',
  imc: 'IMC',
  examenesRealizados: 'Examenes realizados',
  motivo: 'Motivo',
  recomendacionesObservacionesRestricciones:
    'Recomendaciones, observaciones y restricciones',
} as const;

export type RecomendacionHistorialCampo = keyof typeof recomendacionHistorialFieldLabels;

export type RecomendacionHistorialCambio = {
  campo: RecomendacionHistorialCampo;
  etiqueta: string;
  anterior: string | null;
  nuevo: string | null;
};

export type RecomendacionHistorySnapshot = Partial<
  Record<RecomendacionHistorialCampo, string | null>
>;

const historyFields = Object.keys(
  recomendacionHistorialFieldLabels,
) as RecomendacionHistorialCampo[];

function normalizeJsonValue(value: Prisma.JsonValue | undefined): string | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? JSON.stringify(value) : null;
  }

  const serialized = JSON.stringify(value);
  return serialized !== '{}' ? serialized : null;
}

export function parseRecomendacionHistorySnapshot(
  value: Prisma.JsonValue | null,
): RecomendacionHistorySnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const snapshot: RecomendacionHistorySnapshot = {};
  const record = value as Record<string, Prisma.JsonValue>;

  for (const field of historyFields) {
    if (field in record) {
      snapshot[field] = normalizeJsonValue(record[field]);
    }
  }

  return snapshot;
}

export function buildRecomendacionHistoryChanges(
  previous: RecomendacionHistorySnapshot,
  next: RecomendacionHistorySnapshot,
): RecomendacionHistorialCambio[] {
  const changes: RecomendacionHistorialCambio[] = [];

  for (const field of historyFields) {
    const beforeValue = previous[field] ?? null;
    const nextValue = next[field] ?? null;

    if (beforeValue === nextValue) {
      continue;
    }

    changes.push({
      campo: field,
      etiqueta: recomendacionHistorialFieldLabels[field],
      anterior: beforeValue,
      nuevo: nextValue,
    });
  }

  return changes;
}
