'use client';

import { useMutation } from '@tanstack/react-query';

import { agendaRequest } from '@/features/agenda/presentation/api-client';
import type { AgendaDoctorOption } from './agenda-creation-types';

type ActiveDoctorsResponse = {
  options: AgendaDoctorOption[];
};

export function useAgendaActiveDoctors(siteId: number) {
  const mutation = useMutation<ActiveDoctorsResponse, Error>({
    mutationFn: () =>
      agendaRequest(`/api/agenda/medicos/options?sedeId=${siteId}`),
  });

  return {
    load: async () => (await mutation.mutateAsync()).options,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? '',
  };
}
