import { dateInTimeZone } from '@/features/agenda/domain/date-time';

type SelectableSlot = {
  id: number;
  estado: string;
};

type FilterableSlot = {
  medicoId: number;
  inicio: string;
};

type SlotFilters = {
  medicoId: number | null;
  date: string;
};

export function availableSlotIds(slots: SelectableSlot[]) {
  return slots
    .filter((slot) => slot.estado === 'DISPONIBLE')
    .map((slot) => slot.id);
}

export function filterAgendaSlots<T extends FilterableSlot>(
  slots: T[],
  filters: SlotFilters,
  timeZone: string,
) {
  return slots.filter((slot) => {
    if (filters.medicoId !== null && slot.medicoId !== filters.medicoId) {
      return false;
    }
    if (
      filters.date &&
      dateInTimeZone(new Date(slot.inicio), timeZone) !== filters.date
    ) {
      return false;
    }
    return true;
  });
}

export function toggleAllAvailableSlots(
  selected: ReadonlySet<number>,
  availableIds: number[],
) {
  const next = new Set(selected);
  const allSelected =
    availableIds.length > 0 && availableIds.every((slotId) => next.has(slotId));

  for (const slotId of availableIds) {
    if (allSelected) next.delete(slotId);
    else next.add(slotId);
  }

  return next;
}
