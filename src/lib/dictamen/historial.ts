import type {
  DictamenOrigenEvento,
  DictamenTipoEvento,
  Prisma,
  ProcedimientoPcl,
} from '@prisma/client';

export const dictamenHistorialFieldLabels = {
  fechaDictamen: 'Fecha de dictamen',
  procedimientoPcl: 'Procedimiento',
  antecedentesClinicos: 'Antecedentes clinicos',
  condicionSalud: 'Condicion de salud actual',
  descripcionHallazgos: 'Descripcion de hallazgos relevantes',
  sustentacionObservaciones: 'Sustentacion y observaciones',
  fechaEstructuracionInvalidez: 'Fecha de estructuracion de invalidez',
  tipoEvento: 'Tipo de evento',
  origenEvento: 'Origen',
} as const;

export type DictamenHistorialCampo = keyof typeof dictamenHistorialFieldLabels;

export type DictamenHistorialCambio = {
  campo: DictamenHistorialCampo;
  etiqueta: string;
  anterior: string | null;
  nuevo: string | null;
};

export type DictamenHistorySnapshot = Partial<
  Record<DictamenHistorialCampo, string | null>
>;

export type DictamenSnapshotSource = {
  numeroDictamen?: string | null;
  fechaDictamen?: Date | null;
  procedimientoPcl?: ProcedimientoPcl | null;
  tipoDictamen?: string | null;
  antecedentesClinicos?: string | null;
  condicionSalud?: string | null;
  descripcionHallazgos?: string | null;
  sustentacionObservaciones?: string | null;
  fechaEstructuracionInvalidez?: Date | null;
  tipoEvento?: DictamenTipoEvento | null;
  origenEvento?: DictamenOrigenEvento | null;
  aplicaAnalisisOcupacional?: boolean | null;
};

const historyFields = Object.keys(
  dictamenHistorialFieldLabels,
) as DictamenHistorialCampo[];

function toIsoString(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function formatDateValue(raw: string | null): string | null {
  if (!raw) return null;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatEnumValue(raw: string | null): string | null {
  if (!raw) return null;

  return raw
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeSnapshotFieldValue(
  field: DictamenHistorialCampo,
  value: Prisma.JsonValue | undefined,
): string | null {
  if (value == null) return null;

  let raw: string | null = null;

  if (typeof value === 'string') {
    const normalized = value.trim();
    raw = normalized.length > 0 ? normalized : null;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    raw = String(value);
  } else if (Array.isArray(value)) {
    raw = value.length > 0 ? JSON.stringify(value) : null;
  } else {
    const serialized = JSON.stringify(value);
    raw = serialized !== '{}' ? serialized : null;
  }

  if (!raw) {
    return null;
  }

  if (field === 'fechaDictamen' || field === 'fechaEstructuracionInvalidez') {
    return formatDateValue(raw);
  }

  if (field === 'procedimientoPcl') {
    return raw === 'A' || raw === 'B' ? `Procedimiento ${raw}` : raw;
  }

  if (field === 'tipoEvento' || field === 'origenEvento') {
    return formatEnumValue(raw);
  }

  return raw;
}

export function resolveDictamenEstadoHistorial(input: {
  estado: boolean;
  reabierto: boolean;
}) {
  if (!input.estado) return 'CERRADO' as const;
  return input.reabierto ? ('REABIERTO' as const) : ('PENDIENTE' as const);
}

export function buildDictamenHistorySnapshot(
  dictamen: DictamenSnapshotSource,
): Prisma.InputJsonObject {
  return {
    numeroDictamen: dictamen.numeroDictamen ?? null,
    fechaDictamen: toIsoString(dictamen.fechaDictamen),
    procedimientoPcl: dictamen.procedimientoPcl ?? null,
    tipoDictamen: dictamen.tipoDictamen ?? null,
    antecedentesClinicos: dictamen.antecedentesClinicos ?? null,
    condicionSalud: dictamen.condicionSalud ?? null,
    descripcionHallazgos: dictamen.descripcionHallazgos ?? null,
    sustentacionObservaciones: dictamen.sustentacionObservaciones ?? null,
    fechaEstructuracionInvalidez: toIsoString(dictamen.fechaEstructuracionInvalidez),
    tipoEvento: dictamen.tipoEvento ?? null,
    origenEvento: dictamen.origenEvento ?? null,
    aplicaAnalisisOcupacional: dictamen.aplicaAnalisisOcupacional ?? null,
  } as Prisma.InputJsonObject;
}

export function parseDictamenHistorySnapshot(
  value: Prisma.JsonValue | null,
): DictamenHistorySnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const snapshot: DictamenHistorySnapshot = {};
  const record = value as Record<string, Prisma.JsonValue>;

  for (const field of historyFields) {
    if (field in record) {
      snapshot[field] = normalizeSnapshotFieldValue(field, record[field]);
    }
  }

  return snapshot;
}

export function buildDictamenHistoryChanges(
  previous: DictamenHistorySnapshot,
  next: DictamenHistorySnapshot,
): DictamenHistorialCambio[] {
  const changes: DictamenHistorialCambio[] = [];

  for (const field of historyFields) {
    const beforeValue = previous[field] ?? null;
    const nextValue = next[field] ?? null;

    if (beforeValue === nextValue) {
      continue;
    }

    changes.push({
      campo: field,
      etiqueta: dictamenHistorialFieldLabels[field],
      anterior: beforeValue,
      nuevo: nextValue,
    });
  }

  return changes;
}
