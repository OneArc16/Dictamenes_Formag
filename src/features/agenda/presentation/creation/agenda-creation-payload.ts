import type { AgendaGenerationInput } from '@/features/agenda/domain/types';
import type { AgendaCreationState } from './agenda-creation-types';

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort();
}

export function buildAgendaCreationPayload(
  siteId: number,
  state: AgendaCreationState,
): AgendaGenerationInput {
  const selectedDoctorIds = new Set(state.selectedDoctors.map((doctor) => doctor.id));
  const inRange = (date: string) =>
    Boolean(state.startDate && state.endDate && date >= state.startDate && date <= state.endDate);

  return {
    sedeId: siteId,
    medicoIds: [...selectedDoctorIds].sort((left, right) => left - right),
    fechaInicial: state.startDate,
    fechaFinal: state.endDate,
    duracionMinutos: state.durationMinutes,
    duracionesPorMedico: Object.entries(state.doctorDurationOverrides)
      .map(([doctorId, durationMinutes]) => ({
        medicoId: Number(doctorId),
        duracionMinutos: durationMinutes,
      }))
      .filter((item) => selectedDoctorIds.has(item.medicoId))
      .sort((left, right) => left.medicoId - right.medicoId),
    fechasExcluidas: uniqueSorted(state.excludedDates.filter(inRange)),
    fechasHabilitadas: uniqueSorted(
      state.enabledAutomaticDates.filter(inRange),
    ),
    exclusionesPorMedico: Object.entries(state.doctorExclusions)
      .map(([doctorId, dates]) => ({
        medicoId: Number(doctorId),
        fechas: uniqueSorted(dates.filter(inRange)),
      }))
      .filter((item) => selectedDoctorIds.has(item.medicoId) && item.fechas.length > 0)
      .sort((left, right) => left.medicoId - right.medicoId),
    horariosPersonalizados: Object.entries(state.doctorScheduleOverrides)
      .map(([doctorId, dates]) => ({
        medicoId: Number(doctorId),
        fechas: dates
          .filter((item) => inRange(item.fecha))
          .map((item) => ({
            fecha: item.fecha,
            bloques: item.bloques
              .map((block) => ({ ...block }))
              .sort(
                (left, right) =>
                  left.horaInicio.localeCompare(right.horaInicio) ||
                  left.horaFin.localeCompare(right.horaFin),
              ),
          }))
          .sort((left, right) => left.fecha.localeCompare(right.fecha)),
      }))
      .filter((item) => selectedDoctorIds.has(item.medicoId) && item.fechas.length > 0)
      .sort((left, right) => left.medicoId - right.medicoId),
  };
}
