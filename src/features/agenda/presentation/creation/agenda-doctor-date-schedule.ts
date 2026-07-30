import { isoDayOfWeek } from '@/features/agenda/domain/date-time';
import type {
  DoctorDateScheduleOverride,
  EffectiveWorkSchedule,
  TimeBlock,
} from '@/features/agenda/domain/types';

export function copyDateOverrides(dates: DoctorDateScheduleOverride[]) {
  return dates.map((item) => ({
    fecha: item.fecha,
    bloques: item.bloques.map((block) => ({ ...block })),
  }));
}

export function defaultBlocksForDate(
  schedule: EffectiveWorkSchedule,
  date: string,
) {
  const day = isoDayOfWeek(date);
  return schedule.bloques
    .filter((block) => block.diaSemana === day)
    .map(({ horaInicio, horaFin }) => ({ horaInicio, horaFin }))
    .sort(
      (left, right) =>
        left.horaInicio.localeCompare(right.horaInicio) ||
        left.horaFin.localeCompare(right.horaFin),
    );
}

export function upsertDateOverride(
  dates: DoctorDateScheduleOverride[],
  date: string,
  blocks: TimeBlock[],
) {
  return [
    ...dates.filter((item) => item.fecha !== date),
    {
      fecha: date,
      bloques: blocks.map((block) => ({ ...block })),
    },
  ].sort((left, right) => left.fecha.localeCompare(right.fecha));
}
