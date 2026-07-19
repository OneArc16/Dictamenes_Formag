import type { DateOnly } from './types';

export function parseDateOnly(value: DateOnly) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function eachDateInclusive(start: DateOnly, end: DateOnly): DateOnly[] {
  const cursor = parseDateOnly(start);
  const last = parseDateOnly(end);
  const dates: DateOnly[] = [];

  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export function differenceInCalendarDays(start: DateOnly, end: DateOnly) {
  return Math.floor((parseDateOnly(end).getTime() - parseDateOnly(start).getTime()) / 86_400_000);
}

export function isoDayOfWeek(date: DateOnly) {
  return parseDateOnly(date).getUTCDay() || 7;
}

export function timeFromDatabase(value: Date) {
  return `${String(value.getUTCHours()).padStart(2, '0')}:${String(value.getUTCMinutes()).padStart(2, '0')}`;
}

function zonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

export function localDateTimeToUtc(date: DateOnly, time: string, timeZone: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let candidate = new Date(desiredAsUtc);

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const actual = zonedParts(candidate, timeZone);
    const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    const delta = desiredAsUtc - actualAsUtc;
    if (delta === 0) break;
    candidate = new Date(candidate.getTime() + delta);
  }

  return candidate;
}

export function dateInTimeZone(date: Date, timeZone: string): DateOnly {
  const parts = zonedParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function broadUtcRange(start: DateOnly, end: DateOnly) {
  const from = parseDateOnly(start);
  from.setUTCDate(from.getUTCDate() - 1);
  const to = parseDateOnly(end);
  to.setUTCDate(to.getUTCDate() + 2);
  return { from, to };
}
