import type { AgendaPreview, WeeklyBlock } from '@/features/agenda/domain/types';

export type AgendaDoctorOption = {
  id: number;
  nombre: string;
  documento: string | null;
  especialidadPrincipal: string | null;
  tieneHorarioParticular: boolean;
};

export type AgendaCreationFieldErrors = Partial<{
  doctors: string;
  startDate: string;
  endDate: string;
  duration: string;
  exclusions: string;
  schedules: string;
}>;

export type AgendaCreationProcess =
  | { status: 'idle' }
  | { status: 'calculating'; revision: number }
  | {
      status: 'ready';
      revision: number;
      preview: AgendaPreview;
      idempotencyKey: string;
      confirmationError?: string;
    }
  | { status: 'stale'; preview: AgendaPreview }
  | { status: 'error'; message: string }
  | {
      status: 'confirming';
      revision: number;
      preview: AgendaPreview;
      idempotencyKey: string;
    };

export type AgendaCreationState = {
  selectedDoctors: AgendaDoctorOption[];
  startDate: string;
  endDate: string;
  durationMinutes: number;
  excludedDates: string[];
  doctorExclusions: Record<number, string[]>;
  doctorScheduleOverrides: Record<number, WeeklyBlock[]>;
  revision: number;
  process: AgendaCreationProcess;
  fieldErrors: AgendaCreationFieldErrors;
  formError: string;
  announcement: string;
};

export type AgendaCreationAction =
  | { type: 'doctorAdded'; doctor: AgendaDoctorOption; maximum: number }
  | { type: 'doctorsAdded'; doctors: AgendaDoctorOption[]; maximum: number }
  | { type: 'doctorRemoved'; doctorId: number }
  | { type: 'rangeChanged'; startDate: string; endDate: string }
  | { type: 'durationChanged'; durationMinutes: number }
  | { type: 'globalDateToggled'; date: string; excluded: boolean }
  | { type: 'doctorDateToggled'; doctorId: number; date: string; excluded: boolean }
  | {
      type: 'doctorScheduleOverrideChanged';
      doctorId: number;
      blocks?: WeeklyBlock[];
    }
  | {
      type: 'validationFailed';
      fieldErrors: AgendaCreationFieldErrors;
      formError: string;
    }
  | { type: 'previewStarted'; revision: number }
  | {
      type: 'previewSucceeded';
      revision: number;
      preview: AgendaPreview;
      idempotencyKey: string;
    }
  | { type: 'previewFailed'; revision: number; message: string }
  | { type: 'confirmationStarted' }
  | { type: 'confirmationFailed'; message: string; stale: boolean };
