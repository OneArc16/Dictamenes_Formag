import type { AgendaCreationContext } from '@/features/agenda/application/agenda-creation-context';
import type {
  AgendaCreationAction,
  AgendaCreationProcess,
  AgendaCreationState,
} from './agenda-creation-types';

function inRange(date: string, startDate: string, endDate: string) {
  return Boolean(startDate && endDate && date >= startDate && date <= endDate);
}

function nextProcessAfterFormChange(process: AgendaCreationProcess): AgendaCreationProcess {
  if (process.status === 'ready' || process.status === 'confirming') {
    return { status: 'stale', preview: process.preview };
  }
  if (process.status === 'stale') return process;
  return { status: 'idle' };
}

function withFormChange(
  state: AgendaCreationState,
  patch: Partial<AgendaCreationState>,
  announcement = '',
): AgendaCreationState {
  return {
    ...state,
    ...patch,
    revision: state.revision + 1,
    process: nextProcessAfterFormChange(state.process),
    fieldErrors: {},
    formError: '',
    announcement,
  };
}

function toggleDate(dates: string[], date: string, enabled: boolean) {
  const next = new Set(dates);
  if (enabled) next.add(date);
  else next.delete(date);
  return [...next].sort();
}

export function createInitialAgendaCreationState(
  context: Extract<AgendaCreationContext, { status: 'ready' }>,
): AgendaCreationState {
  return {
    selectedDoctors: [],
    startDate: context.today,
    endDate: context.defaultEndDate,
    durationMinutes: 30,
    excludedDates: [],
    doctorExclusions: {},
    doctorScheduleOverrides: {},
    revision: 0,
    process: { status: 'idle' },
    fieldErrors: {},
    formError: '',
    announcement: '',
  };
}

export function agendaCreationReducer(
  state: AgendaCreationState,
  action: AgendaCreationAction,
): AgendaCreationState {
  switch (action.type) {
    case 'doctorAdded': {
      if (state.selectedDoctors.some((doctor) => doctor.id === action.doctor.id)) return state;
      if (state.selectedDoctors.length >= action.maximum) {
        return {
          ...state,
          announcement: `Alcanzaste el límite de ${action.maximum} médicos por generación.`,
        };
      }
      return withFormChange(
        state,
        { selectedDoctors: [...state.selectedDoctors, action.doctor] },
        `${action.doctor.nombre} fue agregado a la agenda.`,
      );
    }
    case 'doctorsAdded': {
      if (action.doctors.length === 0) {
        return {
          ...state,
          announcement: 'No hay médicos activos disponibles en la sede.',
        };
      }

      const selectedIds = new Set(state.selectedDoctors.map((doctor) => doctor.id));
      const availableDoctors = action.doctors.filter((doctor) => {
        if (selectedIds.has(doctor.id)) return false;
        selectedIds.add(doctor.id);
        return true;
      });
      const remainingCapacity = Math.max(0, action.maximum - state.selectedDoctors.length);
      const addedDoctors = availableDoctors.slice(0, remainingCapacity);

      if (addedDoctors.length === 0) {
        return {
          ...state,
          announcement:
            remainingCapacity === 0
              ? `Alcanzaste el límite de ${action.maximum} médicos por generación.`
              : 'Todos los médicos activos disponibles ya estaban agregados.',
        };
      }

      const reachedLimit = addedDoctors.length < availableDoctors.length;
      return withFormChange(
        state,
        { selectedDoctors: [...state.selectedDoctors, ...addedDoctors] },
        `${addedDoctors.length} médicos activos fueron agregados.${
          reachedLimit ? ` Se alcanzó el límite de ${action.maximum}.` : ''
        }`,
      );
    }
    case 'doctorRemoved': {
      const doctor = state.selectedDoctors.find((item) => item.id === action.doctorId);
      if (!doctor) return state;
      const doctorExclusions = { ...state.doctorExclusions };
      delete doctorExclusions[action.doctorId];
      const doctorScheduleOverrides = { ...state.doctorScheduleOverrides };
      delete doctorScheduleOverrides[action.doctorId];
      return withFormChange(
        state,
        {
          selectedDoctors: state.selectedDoctors.filter((item) => item.id !== action.doctorId),
          doctorExclusions,
          doctorScheduleOverrides,
        },
        `${doctor.nombre} fue retirado de la agenda.`,
      );
    }
    case 'rangeChanged': {
      const excludedDates = state.excludedDates.filter((date) =>
        inRange(date, action.startDate, action.endDate),
      );
      const doctorExclusions = Object.fromEntries(
        Object.entries(state.doctorExclusions)
          .map(([doctorId, dates]) => [
            doctorId,
            dates.filter((date) => inRange(date, action.startDate, action.endDate)),
          ])
          .filter(([, dates]) => (dates as string[]).length > 0),
      );
      return withFormChange(state, {
        startDate: action.startDate,
        endDate: action.endDate,
        excludedDates,
        doctorExclusions,
      });
    }
    case 'durationChanged':
      if (state.durationMinutes === action.durationMinutes) return state;
      return withFormChange(state, { durationMinutes: action.durationMinutes });
    case 'globalDateToggled':
      return withFormChange(state, {
        excludedDates: toggleDate(state.excludedDates, action.date, action.excluded),
      });
    case 'doctorDateToggled': {
      if (!state.selectedDoctors.some((doctor) => doctor.id === action.doctorId)) return state;
      const dates = toggleDate(
        state.doctorExclusions[action.doctorId] ?? [],
        action.date,
        action.excluded,
      );
      const doctorExclusions = { ...state.doctorExclusions };
      if (dates.length > 0) doctorExclusions[action.doctorId] = dates;
      else delete doctorExclusions[action.doctorId];
      return withFormChange(state, { doctorExclusions });
    }
    case 'doctorScheduleOverrideChanged': {
      if (!state.selectedDoctors.some((doctor) => doctor.id === action.doctorId)) return state;
      const doctorScheduleOverrides = { ...state.doctorScheduleOverrides };
      if (action.blocks?.length) {
        doctorScheduleOverrides[action.doctorId] = action.blocks.map((block) => ({ ...block }));
      } else {
        delete doctorScheduleOverrides[action.doctorId];
      }
      return withFormChange(
        state,
        { doctorScheduleOverrides },
        action.blocks?.length
          ? 'El horario se personalizó únicamente para esta agenda.'
          : 'Se restableció el horario predeterminado para esta agenda.',
      );
    }
    case 'validationFailed':
      return {
        ...state,
        fieldErrors: action.fieldErrors,
        formError: action.formError,
        announcement: '',
      };
    case 'previewStarted':
      return {
        ...state,
        process: { status: 'calculating', revision: action.revision },
        fieldErrors: {},
        formError: '',
      };
    case 'previewSucceeded':
      if (state.revision !== action.revision) return state;
      return {
        ...state,
        process: {
          status: 'ready',
          revision: action.revision,
          preview: action.preview,
          idempotencyKey: action.idempotencyKey,
        },
        formError: '',
      };
    case 'previewFailed':
      if (state.revision !== action.revision) return state;
      return {
        ...state,
        process: { status: 'error', message: action.message },
        formError: '',
      };
    case 'confirmationStarted':
      if (state.process.status !== 'ready' || state.process.revision !== state.revision) return state;
      return {
        ...state,
        process: {
          status: 'confirming',
          revision: state.process.revision,
          preview: state.process.preview,
          idempotencyKey: state.process.idempotencyKey,
        },
        formError: '',
      };
    case 'confirmationFailed':
      if (state.process.status !== 'confirming') return state;
      return {
        ...state,
        process: action.stale
          ? { status: 'stale', preview: state.process.preview }
          : {
              status: 'ready',
              revision: state.process.revision,
              preview: state.process.preview,
              idempotencyKey: state.process.idempotencyKey,
              confirmationError: action.message,
            },
        formError: '',
      };
    default:
      return state;
  }
}
