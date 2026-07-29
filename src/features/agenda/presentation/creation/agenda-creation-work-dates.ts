import { isoDayOfWeek } from '@/features/agenda/domain/date-time';
import type {
  EffectiveDoctorWorkSchedule,
  WeeklyBlock,
} from '@/features/agenda/domain/types';

type AgendaWorkDates = {
  complete: boolean;
  allDoctors: string[];
  byDoctor: Record<number, string[]>;
};

export function deriveAgendaWorkDates(
  periodDates: string[],
  doctorIds: number[],
  effectiveSchedules: EffectiveDoctorWorkSchedule[],
  scheduleOverrides: Record<number, WeeklyBlock[]>,
): AgendaWorkDates {
  if (doctorIds.length === 0) {
    return { complete: false, allDoctors: [], byDoctor: {} };
  }

  const schedulesByDoctor = new Map(
    effectiveSchedules.map((item) => [item.medicoId, item]),
  );
  if (doctorIds.some((doctorId) => !schedulesByDoctor.has(doctorId))) {
    return { complete: false, allDoctors: [], byDoctor: {} };
  }

  const allDoctors = new Set<string>();
  const byDoctor: Record<number, string[]> = {};

  for (const doctorId of doctorIds) {
    const effectiveSchedule = schedulesByDoctor.get(doctorId)!;
    const blocks =
      scheduleOverrides[doctorId] ?? effectiveSchedule.schedule?.bloques ?? [];
    const workingDays = new Set(blocks.map((block) => block.diaSemana));
    const dates = periodDates.filter((date) => workingDays.has(isoDayOfWeek(date)));
    byDoctor[doctorId] = dates;
    dates.forEach((date) => allDoctors.add(date));
  }

  return {
    complete: true,
    allDoctors: [...allDoctors].sort(),
    byDoctor,
  };
}
