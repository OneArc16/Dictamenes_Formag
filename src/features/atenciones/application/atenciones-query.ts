import type { Prisma } from '@prisma/client';

import { bogotaDayRange } from '@/features/reception/application/reception-service';

/**
 * Estados que ve el médico. "Activado" no existe como estado de la cita: es una cita ASIGNADA
 * que recepción ya activó (activadaAt), es decir, el paciente llegó y espera ser atendido.
 */
export const ATENCION_ESTADOS = ['ACTIVADAS', 'ATENDIDAS', 'TODAS'] as const;
export type EstadoAtencionFiltro = (typeof ATENCION_ESTADOS)[number];

export type AtencionesQuery = {
  estado: EstadoAtencionFiltro;
  medicoId: number | null;
  documento: string;
  fechaDesde: string | null;
  fechaHasta: string | null;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DOCUMENT_LENGTH = 20;

const activadas: Prisma.CitaWhereInput = { estado: 'ASIGNADA', activadaAt: { not: null } };
const atendidas: Prisma.CitaWhereInput = { estado: 'ATENDIDA' };

function validDate(value: string | null) {
  const trimmed = value?.trim() ?? '';
  return DATE_PATTERN.test(trimmed) ? trimmed : null;
}

export function parseAtencionesQuery(params: URLSearchParams): AtencionesQuery {
  const estado = (params.get('estado') ?? '').trim().toUpperCase();
  const medicoId = Number(params.get('medicoId'));
  return {
    estado: ATENCION_ESTADOS.includes(estado as EstadoAtencionFiltro) ? (estado as EstadoAtencionFiltro) : 'ACTIVADAS',
    medicoId: Number.isInteger(medicoId) && medicoId > 0 ? medicoId : null,
    documento: (params.get('documento') ?? '').trim().slice(0, MAX_DOCUMENT_LENGTH),
    fechaDesde: validDate(params.get('fechaDesde')),
    fechaHasta: validDate(params.get('fechaHasta')),
  };
}

export function buildAtencionesWhere(query: AtencionesQuery): Prisma.CitaWhereInput {
  const and: Prisma.CitaWhereInput[] = [
    query.estado === 'ACTIVADAS' ? activadas : query.estado === 'ATENDIDAS' ? atendidas : { OR: [activadas, atendidas] },
  ];
  if (query.medicoId !== null) and.push({ medicoId: query.medicoId });
  if (query.documento) and.push({ paciente: { identificacion: { contains: query.documento, mode: 'insensitive' } } });
  if (query.fechaDesde || query.fechaHasta) {
    and.push({
      inicioProgramado: {
        ...(query.fechaDesde ? { gte: bogotaDayRange(query.fechaDesde).gte } : {}),
        ...(query.fechaHasta ? { lt: bogotaDayRange(query.fechaHasta).lt } : {}),
      },
    });
  }
  return { AND: and };
}

/** Los activados se atienden por orden de llegada a la agenda; el resto, lo más reciente primero. */
export function atencionesOrderBy(estado: EstadoAtencionFiltro): Prisma.CitaOrderByWithRelationInput[] {
  const direction = estado === 'ACTIVADAS' ? 'asc' : 'desc';
  return [{ inicioProgramado: direction }, { id: direction }];
}
