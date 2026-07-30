'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useReducer } from 'react';

import type { AgendaCreationContext } from '@/features/agenda/application/agenda-creation-context';
import type {
  AgendaPreview,
  DoctorDateScheduleOverride,
} from '@/features/agenda/domain/types';
import {
  AgendaRequestError,
  agendaRequest,
} from '@/features/agenda/presentation/api-client';
import { buildAgendaCreationPayload } from './agenda-creation-payload';
import {
  agendaCreationReducer,
  createInitialAgendaCreationState,
} from './agenda-creation-reducer';
import type { AgendaDoctorOption } from './agenda-creation-types';
import { validateAgendaCreationPayload } from './agenda-creation-validation';

type ReadyContext = Extract<AgendaCreationContext, { status: 'ready' }>;

type PreviewVariables = {
  revision: number;
  payload: ReturnType<typeof buildAgendaCreationPayload>;
};

type ConfirmationVariables = PreviewVariables & {
  idempotencyKey: string;
  previewFingerprint: string;
};

export function useAgendaCreationController(context: ReadyContext) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    agendaCreationReducer,
    context,
    createInitialAgendaCreationState,
  );

  const previewMutation = useMutation<{ preview: AgendaPreview }, Error, PreviewVariables>({
    mutationFn: ({ payload }) =>
      agendaRequest('/api/agenda/generaciones/preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: ({ preview }, variables) => {
      dispatch({
        type: 'previewSucceeded',
        revision: variables.revision,
        preview,
        idempotencyKey: crypto.randomUUID(),
      });
    },
    onError: (error, variables) => {
      dispatch({
        type: 'previewFailed',
        revision: variables.revision,
        message: error.message,
      });
    },
  });

  const confirmationMutation = useMutation<
    { result: { generacionId: number } },
    Error,
    ConfirmationVariables
  >({
    mutationFn: ({ payload, idempotencyKey, previewFingerprint }) =>
      agendaRequest('/api/agenda/generaciones', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          idempotencyKey,
          previewFingerprint,
        }),
      }),
    onSuccess: ({ result }) => {
      router.push(`/agenda/generaciones/${result.generacionId}`);
    },
    onError: (error) => {
      dispatch({
        type: 'confirmationFailed',
        message: error.message,
        stale: error instanceof AgendaRequestError && error.status === 409,
      });
    },
  });

  const calculate = () => {
    const payload = buildAgendaCreationPayload(context.site.id, state);
    const validation = validateAgendaCreationPayload(payload, context);
    if (!validation.valid) {
      dispatch({
        type: 'validationFailed',
        fieldErrors: validation.fieldErrors,
        formError: validation.message,
      });
      return;
    }

    const revision = state.revision;
    dispatch({ type: 'previewStarted', revision });
    previewMutation.mutate({ revision, payload });
  };

  const confirm = () => {
    if (state.process.status !== 'ready') return;
    if (
      state.process.revision !== state.revision ||
      state.process.preview.bloqueado ||
      state.process.preview.totalNuevos === 0
    ) {
      return;
    }

    const variables: ConfirmationVariables = {
      revision: state.revision,
      payload: buildAgendaCreationPayload(context.site.id, state),
      idempotencyKey: state.process.idempotencyKey,
      previewFingerprint: state.process.preview.fingerprint,
    };
    dispatch({ type: 'confirmationStarted' });
    confirmationMutation.mutate(variables);
  };

  return {
    state,
    addDoctor: (doctor: AgendaDoctorOption) =>
      dispatch({ type: 'doctorAdded', doctor, maximum: context.limits.maxDoctors }),
    addDoctors: (doctors: AgendaDoctorOption[]) =>
      dispatch({ type: 'doctorsAdded', doctors, maximum: context.limits.maxDoctors }),
    removeDoctor: (doctorId: number) => dispatch({ type: 'doctorRemoved', doctorId }),
    changeRange: (startDate: string, endDate: string) =>
      dispatch({ type: 'rangeChanged', startDate, endDate }),
    changeDuration: (durationMinutes: number) =>
      dispatch({ type: 'durationChanged', durationMinutes }),
    changeDoctorDuration: (
      doctorId: number,
      durationMinutes?: number,
    ) =>
      dispatch({
        type: 'doctorDurationChanged',
        doctorId,
        durationMinutes,
      }),
    toggleGlobalDate: (date: string, excluded: boolean) =>
      dispatch({ type: 'globalDateToggled', date, excluded }),
    toggleDoctorDate: (doctorId: number, date: string, excluded: boolean) =>
      dispatch({ type: 'doctorDateToggled', doctorId, date, excluded }),
    changeDoctorSchedule: (
      doctorId: number,
      dates?: DoctorDateScheduleOverride[],
    ) =>
      dispatch({ type: 'doctorScheduleOverrideChanged', doctorId, dates }),
    toggleAutomaticDate: (date: string, enabled: boolean) =>
      dispatch({ type: 'automaticDateToggled', date, enabled }),
    calculate,
    confirm,
  };
}
