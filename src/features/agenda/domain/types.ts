export type DateOnly = string;

export type WeeklyBlock = {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
};

export type TimeBlock = {
  horaInicio: string;
  horaFin: string;
};

export type DoctorDateScheduleOverride = {
  fecha: DateOnly;
  bloques: TimeBlock[];
};

export type SlotCandidate = {
  medicoId: number;
  sedeId: number;
  horarioLaboralId: number;
  fecha: DateOnly;
  inicio: Date;
  fin: Date;
  duracionMinutos: number;
};

export type AgendaGenerationInput = {
  sedeId: number;
  medicoIds: number[];
  fechaInicial: DateOnly;
  fechaFinal: DateOnly;
  duracionMinutos: number;
  duracionesPorMedico: Array<{
    medicoId: number;
    duracionMinutos: number;
  }>;
  fechasExcluidas: DateOnly[];
  fechasHabilitadas: DateOnly[];
  exclusionesPorMedico: Array<{
    medicoId: number;
    fechas: DateOnly[];
  }>;
  horariosPersonalizados: Array<{
    medicoId: number;
    fechas: DoctorDateScheduleOverride[];
  }>;
};

export type AgendaPreviewDoctor = {
  medicoId: number;
  medicoNombre: string;
  duracionMinutos: number;
  horarioLaboralId: number | null;
  horarioLaboralNombre: string | null;
  horarioOrigen: 'SEDE' | 'PARTICULAR' | 'PERSONALIZADO' | null;
  fechasLaborales: number;
  fechasLaboralesLista: DateOnly[];
  fechasExcluidas: number;
  totalCandidatos: number;
  totalNuevos: number;
  totalOmitidos: number;
  totalConflictos: number;
  errores: string[];
};

export type EffectiveWorkSchedule = {
  id: number;
  nombre: string;
  origen: 'SEDE' | 'PARTICULAR';
  zonaHoraria: string;
  bloques: WeeklyBlock[];
};

export type EffectiveDoctorWorkSchedule = {
  medicoId: number;
  schedule: EffectiveWorkSchedule | null;
  error: string | null;
};

export type AgendaPreview = {
  fingerprint: string;
  sedeId: number;
  sedeNombre: string;
  fechaInicial: DateOnly;
  fechaFinal: DateOnly;
  duracionMinutos: number;
  zonaHoraria: string;
  totalMedicos: number;
  totalCandidatos: number;
  totalNuevos: number;
  totalOmitidos: number;
  totalConflictos: number;
  fechasLaboralesEvaluadas: DateOnly[];
  bloqueado: boolean;
  errores: string[];
  medicos: AgendaPreviewDoctor[];
};
