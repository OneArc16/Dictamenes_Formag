'use client';

import { useEffect, useMemo, useState } from 'react';

export type AgendaHoliday = {
  date: string;
  name: string;
};

export function useAgendaHolidays(periodDates: string[], enabled: boolean) {
  const [holidays, setHolidays] = useState<AgendaHoliday[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const years = useMemo(
    () => [...new Set(periodDates.map((date) => Number(date.slice(0, 4))))],
    [periodDates],
  );
  const yearsKey = years.join(',');

  useEffect(() => {
    if (!enabled || years.length === 0) {
      setHolidays([]);
      setError('');
      setIsLoading(false);
      return;
    }

    let active = true;
    setError('');
    setIsLoading(true);

    void import('date-holidays')
      .then(({ default: Holidays }) => {
        const calendar = new Holidays('CO', {
          languages: ['es'],
          timezone: 'America/Bogota',
          types: ['public'],
        });
        const period = new Set(periodDates);
        const byDate = new Map<string, AgendaHoliday>();

        years.forEach((year) => {
          calendar.getHolidays(year, 'es').forEach((holiday) => {
            const date = holiday.date.slice(0, 10);
            if (holiday.type === 'public' && period.has(date)) {
              byDate.set(date, { date, name: holiday.name });
            }
          });
        });

        if (active) {
          setHolidays(
            [...byDate.values()].sort((left, right) =>
              left.date.localeCompare(right.date),
            ),
          );
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setHolidays([]);
          setError('No fue posible identificar los festivos del periodo.');
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, periodDates, years, yearsKey]);

  return { holidays, error, isLoading };
}
