import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function parseLocalDateOnly(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function toDateOnly(value: Date) {
  return format(value, 'yyyy-MM-dd');
}

export function addDateOnlyDays(value: string, days: number) {
  const date = parseLocalDateOnly(value);
  if (!date) return undefined;
  date.setDate(date.getDate() + days);
  return date;
}

export function formatAgendaDate(value: string) {
  const date = parseLocalDateOnly(value);
  return date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: es }) : '';
}

export function formatAgendaDateShort(value: string) {
  const date = parseLocalDateOnly(value);
  return date ? format(date, 'EEE d MMM', { locale: es }) : value;
}

export function formatAgendaDateInput(value: string) {
  const date = parseLocalDateOnly(value);
  return date ? format(date, 'dd/MM/yyyy') : 'dd/mm/aaaa';
}

export function calendarMonthDates(month: Date, numberOfMonths: number) {
  const cursor = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(
    month.getFullYear(),
    month.getMonth() + numberOfMonths,
    0,
  );
  const dates: string[] = [];

  while (cursor <= end) {
    dates.push(toDateOnly(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}
