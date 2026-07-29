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
    fechasExcluidas: uniqueSorted(state.excludedDates.filter(inRange)),
    exclusionesPorMedico: Object.entries(state.doctorExclusions)
      .map(([doctorId, dates]) => ({
        medicoId: Number(doctorId),
        fechas: uniqueSorted(dates.filter(inRange)),
      }))
      .filter((item) => selectedDoctorIds.has(item.medicoId) && item.fechas.length > 0)
      .sort((left, right) => left.medicoId - right.medicoId),
    horariosPersonalizados: Object.entries(state.doctorScheduleOverrides)
      .map(([doctorId, blocks]) => ({
        medicoId: Number(doctorId),
        bloques: blocks.map((block) => ({ ...block })),
      }))
      .filter((item) => selectedDoctorIds.has(item.medicoId) && item.bloques.length > 0)
      .sort((left, right) => left.medicoId - right.medicoId),
  };
}
