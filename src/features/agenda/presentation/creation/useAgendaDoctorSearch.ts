'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { agendaRequest } from '@/features/agenda/presentation/api-client';
import type { AgendaDoctorOption } from './agenda-creation-types';

const MIN_SEARCH_LENGTH = 2;

export function useAgendaDoctorSearch(siteId: number) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < MIN_SEARCH_LENGTH) return;

    const timeoutId = window.setTimeout(() => setDebouncedQuery(normalized), 300);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const normalizedQuery = query.trim();
  const effectiveQuery =
    normalizedQuery.length >= MIN_SEARCH_LENGTH && debouncedQuery === normalizedQuery
      ? debouncedQuery
      : '';
  const isDebouncing =
    normalizedQuery.length >= MIN_SEARCH_LENGTH && effectiveQuery.length === 0;

  const doctorsQuery = useQuery<{ options: AgendaDoctorOption[] }, Error>({
    queryKey: ['agenda-doctors', siteId, effectiveQuery],
    enabled: effectiveQuery.length >= MIN_SEARCH_LENGTH,
    queryFn: () =>
      agendaRequest(
        `/api/agenda/medicos/options?sedeId=${siteId}&search=${encodeURIComponent(effectiveQuery)}`,
      ),
    staleTime: 30_000,
    retry: 1,
  });

  return {
    query,
    setQuery,
    minimumLength: MIN_SEARCH_LENGTH,
    options: effectiveQuery ? doctorsQuery.data?.options ?? [] : [],
    isLoading: isDebouncing || doctorsQuery.isFetching,
    error: doctorsQuery.error?.message ?? '',
    retry: doctorsQuery.refetch,
  };
}
