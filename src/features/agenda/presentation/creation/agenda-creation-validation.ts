import type { AgendaCreationContext } from '@/features/agenda/application/agenda-creation-context';
import { differenceInCalendarDays } from '@/features/agenda/domain/date-time';
import type { AgendaGenerationInput } from '@/features/agenda/domain/types';
import { agendaGenerationSchema } from '@/features/agenda/domain/validation';
import type { AgendaCreationFieldErrors } from './agenda-creation-types';

type ReadyContext = Extract<AgendaCreationContext, { status: 'ready' }>;

export type AgendaCreationValidation =
  | { valid: true }
  | {
      valid: false;
      fieldErrors: AgendaCreationFieldErrors;
      message: string;
    };

function fieldForPath(path: PropertyKey): keyof AgendaCreationFieldErrors | null {
  if (path === 'medicoIds') return 'doctors';
  if (path === 'fechaInicial') return 'startDate';
  if (path === 'fechaFinal') return 'endDate';
  if (path === 'duracionMinutos') return 'duration';
  if (path === 'fechasExcluidas' || path === 'exclusionesPorMedico') return 'exclusions';
  if (path === 'horariosPersonalizados') return 'schedules';
  return null;
}

export function validateAgendaCreationPayload(
  payload: AgendaGenerationInput,
  context: ReadyContext,
): AgendaCreationValidation {
  const parsed = agendaGenerationSchema.safeParse(payload);
  const fieldErrors: AgendaCreationFieldErrors = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = fieldForPath(issue.path[0]);
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
  } else {
    if (payload.fechaInicial < context.today) {
      fieldErrors.startDate = 'La fecha inicial debe ser hoy o una fecha futura.';
    }
    const days = differenceInCalendarDays(payload.fechaInicial, payload.fechaFinal);
    if (days > context.limits.maxRangeDays - 1) {
      fieldErrors.endDate = `El periodo puede tener máximo ${context.limits.maxRangeDays} días.`;
    }
  }

  if (Object.keys(fieldErrors).length === 0) return { valid: true };
  return {
    valid: false,
    fieldErrors,
    message: 'Revisa los campos indicados antes de calcular la agenda.',
  };
}
