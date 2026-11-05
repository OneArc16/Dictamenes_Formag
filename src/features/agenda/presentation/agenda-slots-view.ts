import { dateInTimeZone } from '@/features/agenda/domain/date-time';

export const AGENDA_VIEW_TIME_ZONE = 'America/Bogota';

export type SlotStatus = 'LIBRE' | 'ASIGNADO' | 'ACTIVADO' | 'ATENDIDO' | 'CANCELADO';

export type AgendaSlotRow = {
  id: number;
  medicoId: number;
  medicoNombre: string;
  sedeNombre: string;
  modalidadNombre: string;
  inicio: string;
  fin: string;
  duracionMinutos: number;
  estado: SlotStatus;
  generacionId: number;
  paciente: { nombre: string; documento: string; citaEstado: string } | null;
  cancelacion: { motivo: string | null; por: string | null; en: string | null } | null;
};

export type DatePresetId = 'hoy' | 'semana' | 'mes' | 'treinta' | 'personalizado';

export const DATE_PRESETS: Array<{ id: Exclude<DatePresetId, 'personalizado'>; label: string }> = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Próximos 7 días' },
  { id: 'mes', label: 'Este mes' },
  { id: 'treinta', label: 'Próximos 30 días' },
];

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function todayInAgendaZone(now = new Date()) {
  return dateInTimeZone(now, AGENDA_VIEW_TIME_ZONE);
}

export function presetRange(preset: Exclude<DatePresetId, 'personalizado'>, today: string) {
  switch (preset) {
    case 'hoy':
      return { desde: today, hasta: today };
    case 'semana':
      return { desde: today, hasta: addDays(today, 6) };
    case 'mes': {
      const [year, month] = today.split('-').map(Number);
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      return { desde: `${today.slice(0, 8)}01`, hasta: `${today.slice(0, 8)}${String(lastDay).padStart(2, '0')}` };
    }
    case 'treinta':
      return { desde: today, hasta: addDays(today, 29) };
  }
}

export type SlotDayGroup = {
  date: string;
  slots: AgendaSlotRow[];
  available: number;
};

/** Agrupa cupos (ya ordenados por inicio) por día local, conservando el orden. */
export function groupSlotsByDay(slots: AgendaSlotRow[], timeZone = AGENDA_VIEW_TIME_ZONE): SlotDayGroup[] {
  const groups: SlotDayGroup[] = [];
  for (const slot of slots) {
    const date = dateInTimeZone(new Date(slot.inicio), timeZone);
    let group = groups.at(-1);
    if (!group || group.date !== date) {
      group = { date, slots: [], available: 0 };
      groups.push(group);
    }
    group.slots.push(slot);
    if (slot.estado === 'LIBRE') group.available += 1;
  }
  return groups;
}

export function formatDayHeading(date: string) {
  const label = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Short day label for a slot row, e.g. "Lun 09/11/2026". */
export function formatSlotDate(date: string) {
  const day = new Date(`${date}T00:00:00.000Z`);
  const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'short', timeZone: 'UTC' })
    .format(day)
    .replace('.', '');
  const [year, month, dayOfMonth] = date.split('-');
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${dayOfMonth}/${month}/${year}`;
}

export function formatTime(value: string, timeZone = AGENDA_VIEW_TIME_ZONE) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(new Date(value));
}

export function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 2 ? parts[parts.length - 2][0] : parts[1]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

/** Divide una lista en lotes del tamaño máximo que acepta la API de cancelación. */
export function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}
