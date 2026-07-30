import Holidays from 'date-holidays';

const holidayCalendar = new Holidays('CO', {
  languages: ['es'],
  timezone: 'America/Bogota',
  types: ['public'],
});

const holidaysByYear = new Map<number, Map<string, string>>();

function publicHolidaysForYear(year: number) {
  const cached = holidaysByYear.get(year);
  if (cached) return cached;

  const holidays = new Map<string, string>();
  holidayCalendar.getHolidays(year, 'es').forEach((holiday) => {
    if (holiday.type === 'public') {
      holidays.set(holiday.date.slice(0, 10), holiday.name);
    }
  });
  holidaysByYear.set(year, holidays);
  return holidays;
}

export function getColombiaPublicHolidays(dates: string[]) {
  const requestedDates = new Set(dates);
  const years = new Set(dates.map((date) => Number(date.slice(0, 4))));
  const result = new Map<string, string>();

  years.forEach((year) => {
    publicHolidaysForYear(year).forEach((name, date) => {
      if (requestedDates.has(date)) result.set(date, name);
    });
  });

  return result;
}
