'use client';

import { useQuery } from '@tanstack/react-query';
import type { AppRole } from '@/lib/module-navigation';

export type AuthMeUser = {
  id: string;
  name: string;
  role: AppRole;
};

async function fetchAuthMe(): Promise<AuthMeUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok || !data?.user) {
      return null;
    }

    return {
      id: String(data.user.id ?? ''),
      name: String(data.user.name ?? 'Usuario'),
      role: String(data.user.role ?? '') as AppRole,
    };
  } catch {
    return null;
  }
}

export function useAuthMe() {
  return useQuery({
    queryKey: ['auth-me'],
    queryFn: fetchAuthMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}