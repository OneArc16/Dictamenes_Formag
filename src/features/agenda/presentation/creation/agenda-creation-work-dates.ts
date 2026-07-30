import { isoDayOfWeek } from '@/features/agenda/domain/date-time';
import type {
  DoctorDateScheduleOverride,
  EffectiveDoctorWorkSchedule,
  WeeklyBlock,
} from '@/features/agenda/domain/types';

export type AgendaDoctorDateSchedule = {
  date: string;
  blocks: WeeklyBlock[];
};

type AgendaWorkDates = {
  complete: boolean;
  allDoctors: string[];
  byDoctor: Record<number, string[]>;
  schedulesByDoctor: Record<number, AgendaDoctorDateSchedule[]>;
  errorsByDoctor: Record<number, string>;
};

export function deriveAgendaWorkDates(
  periodDates: string[],
  doctorIds: number[],
  effectiveSchedules: EffectiveDoctorWorkSchedule[],
  scheduleOverrides: Record<number, DoctorDateScheduleOverride[]>,
  automaticallyClosedDates: string[] = [],
  enabledAutomaticDates: string[] = [],
): AgendaWorkDates {
  if (doctorIds.length === 0) {
    return {
      complete: false,
      allDoctors: [],
      byDoctor: {},
      schedulesByDoctor: {},
      errorsByDoctor: {},
    };
  }

  const schedulesByDoctor = new Map(
    effectiveSchedules.map((item) => [item.medicoId, item]),
  );
  if (doctorIds.some((doctorId) => !schedulesByDoctor.has(doctorId))) {
    return {
      complete: false,
      allDoctors: [],
      byDoctor: {},
      schedulesByDoctor: {},
      errorsByDoctor: {},
    };
  }

  const allDoctors = new Set<string>();
  const automaticallyClosed = new Set(automaticallyClosedDates);
  const automaticallyEnabled = new Set(enabledAutomaticDates);
  const byDoctor: Record<number, string[]> = {};
  const dateSchedulesByDoctor: Record<number, AgendaDoctorDateSchedule[]> = {};
  const errorsByDoctor: Record<number, string> = {};

  for (const doctorId of doctorIds) {
    const effectiveSchedule = schedulesByDoctor.get(doctorId)!;
    const defaultBlocks = [...(effectiveSchedule.schedule?.bloques ?? [])].sort(
      (left, right) =>
        left.diaSemana - right.diaSemana ||
        left.horaInicio.localeCompare(right.horaInicio) ||
        left.horaFin.localeCompare(right.horaFin),
    );
    const overridesByDate = new Map(
      (scheduleOverrides[doctorId] ?? []).map((item) => [item.fecha, item.bloques]),
    );
    const dateSchedules = periodDates.flatMap((date) => {
      const day = isoDayOfWeek(date);
      const customBlocks = overridesByDate.get(date);
      if (
        automaticallyClosed.has(date) &&
        !automaticallyEnabled.has(date) &&
        !customBlocks
      ) {
        return [];
      }
      const dateBlocks: WeeklyBlock[] = customBlocks
        ? customBlocks
            .map((block) => ({ ...block, diaSemana: day }))
            .sort(
              (left, right) =>
                left.horaInicio.localeCompare(right.horaInicio) ||
                left.horaFin.localeCompare(right.horaFin),
            )
        : defaultBlocks.filter((block) => block.diaSemana === day);
      return dateBlocks.length > 0
        ? [{ date, blocks: dateBlocks.map((block) => ({ ...block })) }]
        : [];
    });
    const dates = dateSchedules.map((item) => item.date);
    byDoctor[doctorId] = dates;
    dateSchedulesByDoctor[doctorId] = dateSchedules;
    if (effectiveSchedule.error) {
      errorsByDoctor[doctorId] = effectiveSchedule.error;
    }
    dates.forEach((date) => allDoctors.add(date));
  }

  return {
    complete: true,
    allDoctors: [...allDoctors].sort(),
    byDoctor,
    schedulesByDoctor: dateSchedulesByDoctor,
    errorsByDoctor,
  };
}
