type ScheduleCandidate = {
  medicoId: number | null;
  activo: boolean;
};

export function resolveEffectiveSchedule<T extends ScheduleCandidate>(
  schedules: T[],
  medicoId: number,
): { schedule: T | null; error: string | null } {
  const particular = schedules.filter(
    (schedule) => schedule.medicoId === medicoId && schedule.activo,
  );
  if (particular.length > 1) {
    return { schedule: null, error: 'Hay más de un horario particular activo.' };
  }
  if (particular[0]) return { schedule: particular[0], error: null };

  const site = schedules.filter(
    (schedule) => schedule.medicoId === null && schedule.activo,
  );
  if (site.length > 1) {
    return { schedule: null, error: 'Hay más de un horario de sede activo.' };
  }
  return { schedule: site[0] ?? null, error: null };
}
