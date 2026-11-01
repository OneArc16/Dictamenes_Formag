'use client';

import { useQuery } from '@tanstack/react-query';

import type { EffectiveDoctorWorkSchedule } from '@/features/agenda/domain/types';
import { agendaRequest } from '@/features/agenda/presentation/api-client';

type EffectiveSchedulesResponse = {
  schedules: EffectiveDoctorWorkSchedule[];
};

export function useAgendaEffectiveSchedules(siteId: number, doctorIds: number[]) {
  const normalizedIds = [...new Set(doctorIds)].sort((left, right) => left - right);
  const doctorIdsKey = normalizedIds.join(',');
  const query = useQuery<EffectiveSchedulesResponse, Error>({
    queryKey: ['agenda-effective-schedules', siteId, doctorIdsKey],
    enabled: normalizedIds.length > 0,
    queryFn: () =>
      agendaRequest(
        `/api/agenda/medicos/horarios-efectivos?sedeId=${siteId}&medicoIds=${doctorIdsKey}`,
      ),
    staleTime: 60_000,
    retry: 1,
  });

  return {
    schedules: query.data?.schedules ?? [],
    isLoading: normalizedIds.length > 0 && query.isPending,
    error: query.error?.message ?? '',
    retry: query.refetch,
  };
}
