import type { Prisma } from '@prisma/client';

import { differenceInCalendarDays, localDateTimeToUtc } from '@/features/agenda/domain/date-time';
import type { DateOnly } from '@/features/agenda/domain/types';

export const AGENDA_TIME_ZONE = 'America/Bogota';

/**
 * Estados que ve el usuario. No son los del cupo en BD: "atendido" vive en la cita (el cupo
 * sigue ASIGNADO al atenderla) y RESERVADO no lo asigna ningún flujo, así que cuenta como asignado.
 */
export const SLOT_STATUSES = ['LIBRE', 'ASIGNADO', 'ATENDIDO', 'CANCELADO'] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

const attendedAppointment: Prisma.CupoMedicoWhereInput = { citas: { some: { estado: 'ATENDIDA' } } };

export function statusWhere(status: SlotStatus): Prisma.CupoMedicoWhereInput {
  switch (status) {
    case 'LIBRE':
      return { estado: 'DISPONIBLE' };
    case 'ASIGNADO':
      return { estado: { in: ['ASIGNADO', 'RESERVADO'] }, NOT: attendedAppointment };
    case 'ATENDIDO':
      return { estado: { in: ['ASIGNADO', 'RESERVADO'] }, ...attendedAppointment };
    case 'CANCELADO':
      return { estado: 'CANCELADO' };
  }
}

export function viewStatus(slotStatus: string, appointmentStatus: string | null | undefined): SlotStatus {
  if (slotStatus === 'DISPONIBLE') return 'LIBRE';
  if (slotStatus === 'CANCELADO') return 'CANCELADO';
  return appointmentStatus === 'ATENDIDA' ? 'ATENDIDO' : 'ASIGNADO';
}

const MAX_RANGE_DAYS = 90;
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 200;
const MAX_SEARCH_LENGTH = 80;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type SlotQueryFilters = {
  desde: DateOnly;
  hasta: DateOnly;
  medicoId: number | null;
  estados: SlotStatus[];
  search: string;
  page: number;
  pageSize: number;
};

export type SlotQueryScope = { medicoId: number | null; sedeId: number | null };

type ParseResult = { ok: true; value: SlotQueryFilters } | { ok: false; error: string };

function positiveInt(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseSlotQuery(params: URLSearchParams): ParseResult {
  const desde = params.get('desde') ?? '';
  const hasta = params.get('hasta') ?? '';
  if (!DATE_PATTERN.test(desde) || !DATE_PATTERN.test(hasta)) {
    return { ok: false, error: 'El rango de fechas es obligatorio.' };
  }
  const days = differenceInCalendarDays(desde, hasta);
  if (Number.isNaN(days) || days < 0) {
    return { ok: false, error: 'La fecha final no puede ser anterior a la inicial.' };
  }
  if (days > MAX_RANGE_DAYS) {
    return { ok: false, error: `El rango consultado no puede superar ${MAX_RANGE_DAYS + 1} días.` };
  }

  const rawStatuses = (params.get('estado') ?? '')
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  const invalidStatus = rawStatuses.find((value) => !SLOT_STATUSES.includes(value as SlotStatus));
  if (invalidStatus) return { ok: false, error: 'El estado de cupo no es válido.' };

  const search = (params.get('q') ?? '').trim().replace(/\s+/g, ' ');
  if (search.length > MAX_SEARCH_LENGTH) {
    return { ok: false, error: `La búsqueda admite máximo ${MAX_SEARCH_LENGTH} caracteres.` };
  }

  return {
    ok: true,
    value: {
      desde,
      hasta,
      medicoId: positiveInt(params.get('medicoId')),
      estados: [...new Set(rawStatuses)] as SlotStatus[],
      search,
      page: positiveInt(params.get('page')) ?? 1,
      pageSize: Math.min(positiveInt(params.get('pageSize')) ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    },
  };
}

/** Días calendario en la zona de la agenda: [desde 00:00, día siguiente a hasta 00:00). */
export function localDayRange(desde: DateOnly, hasta: DateOnly, timeZone = AGENDA_TIME_ZONE) {
  const end = new Date(`${hasta}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  return {
    gte: localDateTimeToUtc(desde, '00:00', timeZone),
    lt: localDateTimeToUtc(end.toISOString().slice(0, 10), '00:00', timeZone),
  };
}

function searchWhere(search: string): Prisma.CupoMedicoWhereInput[] {
  // Cada palabra debe aparecer en el nombre del médico o en el nombre/documento del paciente.
  return search.split(' ').map((term) => {
    const contains = { contains: term, mode: 'insensitive' as const };
    return {
      OR: [
        { medico: { OR: [{ primerNombre: contains }, { segundoNombre: contains }, { primerApellido: contains }, { segundoApellido: contains }] } },
        {
          citas: {
            some: {
              estado: { in: ['ASIGNADA', 'ATENDIDA'] },
              paciente: {
                OR: [
                  { identificacion: contains },
                  { primerNombre: contains },
                  { segundoNombre: contains },
                  { primerApellido: contains },
                  { segundoApellido: contains },
                ],
              },
            },
          },
        },
      ],
    };
  });
}

type WhereParts = { estado?: boolean; medico?: boolean; search?: boolean };

/**
 * Filtro de cupos. `include` permite omitir partes para calcular facetas: los contadores por
 * estado ignoran el filtro de estado y la lista de médicos ignora médico, estado y búsqueda.
 */
export function buildSlotWhere(
  filters: SlotQueryFilters,
  scope: SlotQueryScope,
  include: WhereParts = { estado: true, medico: true, search: true },
): Prisma.CupoMedicoWhereInput {
  const and: Prisma.CupoMedicoWhereInput[] = [{ inicio: localDayRange(filters.desde, filters.hasta) }];
  if (scope.sedeId) and.push({ sedeId: scope.sedeId });

  // Un médico con lectura propia solo ve sus cupos, pida lo que pida.
  const medicoId = scope.medicoId ?? (include.medico ? filters.medicoId : null);
  if (medicoId) and.push({ medicoId });
  if (include.estado && filters.estados.length > 0) and.push({ OR: filters.estados.map(statusWhere) });
  if (include.search && filters.search) and.push(...searchWhere(filters.search));

  return { AND: and };
}
