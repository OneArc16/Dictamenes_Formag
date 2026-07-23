const WEEKDAYS_ES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

export function isValidIsoDate(fechaIso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaIso);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

export function parseColombiaDate(fechaIso: string): Date {
  if (!isValidIsoDate(fechaIso)) throw new Error('Fecha inválida.');
  const date = new Date(`${fechaIso}T00:00:00.000-05:00`);
  return date;
}

export function formatDateOnly(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function getDiaSemanaBogota(fechaIso: string | null | undefined): string | null {
  if (!fechaIso) return null;
  const date = parseColombiaDate(fechaIso);
  const weekday = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    timeZone: 'America/Bogota',
  }).format(date);

  return weekday || WEEKDAYS_ES[date.getUTCDay()];
}
