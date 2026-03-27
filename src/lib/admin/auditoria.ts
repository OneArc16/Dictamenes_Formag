import { Prisma } from '@prisma/client';

export type AuditTipo = 'REAPERTURA' | 'EDICION' | 'CIERRE';
export type AuditModulo = 'RECOMENDACIONES' | 'DICTAMENES';

export type AuditFiltersInput = {
  q?: string;
  tipo?: string;
  modulo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number | string | null;
};

export function normalizeDateStart(value: string) {
  return new Date(`${value}T00:00:00.000-05:00`);
}

export function normalizeDateEnd(value: string) {
  return new Date(`${value}T23:59:59.999-05:00`);
}

export function normalizeModulo(value: string) {
  return value.trim().toUpperCase() === 'DICTAMENES' ? 'DICTAMENES' : 'RECOMENDACIONES';
}

export function fullName(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

export function formatAuditDateTime(value: Date) {
  return value.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildAuditQueryString({
  q = '',
  tipo = 'all',
  modulo = 'RECOMENDACIONES',
  fechaDesde = '',
  fechaHasta = '',
  page,
}: AuditFiltersInput) {
  const params = new URLSearchParams();

  const normalizedQ = q.trim();
  if (normalizedQ) params.set('q', normalizedQ);

  const normalizedTipo = tipo.trim().toUpperCase();
  if (normalizedTipo && normalizedTipo !== 'ALL') params.set('tipo', normalizedTipo);

  const normalizedModulo = normalizeModulo(modulo);
  if (normalizedModulo !== 'RECOMENDACIONES') params.set('modulo', normalizedModulo);

  const normalizedFechaDesde = fechaDesde.trim();
  if (normalizedFechaDesde) params.set('fechaDesde', normalizedFechaDesde);

  const normalizedFechaHasta = fechaHasta.trim();
  if (normalizedFechaHasta) params.set('fechaHasta', normalizedFechaHasta);

  const normalizedPage = Number(page ?? 1);
  if (Number.isFinite(normalizedPage) && normalizedPage > 1) {
    params.set('page', String(normalizedPage));
  }

  return params.toString();
}

export function buildDictamenAuditWhere({
  q = '',
  tipo = 'all',
  fechaDesde = '',
  fechaHasta = '',
}: AuditFiltersInput): Prisma.DictamenHistorialWhereInput {
  const where: Prisma.DictamenHistorialWhereInput = {};
  const normalizedTipo = tipo.trim().toUpperCase();

  if (normalizedTipo === 'REAPERTURA' || normalizedTipo === 'EDICION' || normalizedTipo === 'CIERRE') {
    where.tipo = normalizedTipo as AuditTipo;
  }

  if (fechaDesde || fechaHasta) {
    where.createdAt = {};
    if (fechaDesde) where.createdAt.gte = normalizeDateStart(fechaDesde);
    if (fechaHasta) where.createdAt.lte = normalizeDateEnd(fechaHasta);
  }

  const normalizedQ = q.trim();
  if (normalizedQ) {
    where.OR = [
      { motivoReapertura: { nombre: { contains: normalizedQ, mode: 'insensitive' } } },
      { dictamen: { numeroDictamen: { contains: normalizedQ, mode: 'insensitive' } } },
      { dictamen: { usuario: { identificacion: { contains: normalizedQ, mode: 'insensitive' } } } },
      { dictamen: { usuario: { primerNombre: { contains: normalizedQ, mode: 'insensitive' } } } },
      { dictamen: { usuario: { segundoNombre: { contains: normalizedQ, mode: 'insensitive' } } } },
      { dictamen: { usuario: { primerApellido: { contains: normalizedQ, mode: 'insensitive' } } } },
      { dictamen: { usuario: { segundoApellido: { contains: normalizedQ, mode: 'insensitive' } } } },
      { dictamen: { empleado: { primerNombre: { contains: normalizedQ, mode: 'insensitive' } } } },
      { dictamen: { empleado: { segundoNombre: { contains: normalizedQ, mode: 'insensitive' } } } },
      { dictamen: { empleado: { primerApellido: { contains: normalizedQ, mode: 'insensitive' } } } },
      { dictamen: { empleado: { segundoApellido: { contains: normalizedQ, mode: 'insensitive' } } } },
      { empleado: { primerNombre: { contains: normalizedQ, mode: 'insensitive' } } },
      { empleado: { segundoNombre: { contains: normalizedQ, mode: 'insensitive' } } },
      { empleado: { primerApellido: { contains: normalizedQ, mode: 'insensitive' } } },
      { empleado: { segundoApellido: { contains: normalizedQ, mode: 'insensitive' } } },
    ];
  }

  return where;
}

export function buildRecomendacionAuditWhere({
  q = '',
  tipo = 'all',
  fechaDesde = '',
  fechaHasta = '',
}: AuditFiltersInput): Prisma.RecomendacionLaboralHistorialWhereInput {
  const where: Prisma.RecomendacionLaboralHistorialWhereInput = {};
  const normalizedTipo = tipo.trim().toUpperCase();

  if (normalizedTipo === 'REAPERTURA' || normalizedTipo === 'EDICION' || normalizedTipo === 'CIERRE') {
    where.tipo = normalizedTipo as AuditTipo;
  }

  if (fechaDesde || fechaHasta) {
    where.createdAt = {};
    if (fechaDesde) where.createdAt.gte = normalizeDateStart(fechaDesde);
    if (fechaHasta) where.createdAt.lte = normalizeDateEnd(fechaHasta);
  }

  const normalizedQ = q.trim();
  if (normalizedQ) {
    where.OR = [
      { motivoReapertura: { nombre: { contains: normalizedQ, mode: 'insensitive' } } },
      { recomendacionLaboral: { numeroRecomendacion: { contains: normalizedQ, mode: 'insensitive' } } },
      { recomendacionLaboral: { usuario: { identificacion: { contains: normalizedQ, mode: 'insensitive' } } } },
      { recomendacionLaboral: { usuario: { primerNombre: { contains: normalizedQ, mode: 'insensitive' } } } },
      { recomendacionLaboral: { usuario: { segundoNombre: { contains: normalizedQ, mode: 'insensitive' } } } },
      { recomendacionLaboral: { usuario: { primerApellido: { contains: normalizedQ, mode: 'insensitive' } } } },
      { recomendacionLaboral: { usuario: { segundoApellido: { contains: normalizedQ, mode: 'insensitive' } } } },
      { empleado: { primerNombre: { contains: normalizedQ, mode: 'insensitive' } } },
      { empleado: { segundoNombre: { contains: normalizedQ, mode: 'insensitive' } } },
      { empleado: { primerApellido: { contains: normalizedQ, mode: 'insensitive' } } },
      { empleado: { segundoApellido: { contains: normalizedQ, mode: 'insensitive' } } },
    ];
  }

  return where;
}

export function buildCsv(header: string[], rows: Array<Array<string | number | null | undefined>>) {
  const lines = [header.map(csvCell).join(';')];

  for (const row of rows) {
    lines.push(row.map(csvCell).join(';'));
  }

  return lines.join('\r\n');
}

export function buildAuditExportFilename(modulo: AuditModulo, extension: 'csv' | 'xlsx' = 'csv') {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const scope = modulo === 'DICTAMENES' ? 'dictamenes' : 'recomendaciones';
  return `auditoria_${scope}_${y}${m}${d}.${extension}`;
}

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}
