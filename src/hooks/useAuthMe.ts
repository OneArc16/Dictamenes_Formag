import { useQuery } from '@tanstack/react-query';
import type { AppRole } from '@/lib/auth/types';

export type AuthMeUser = {
  id: string;
  name: string;
  role: AppRole;
  perfilId: number | null;
  perfilNombre: string | null;
  permissions: string[];
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
      perfilId:
        typeof data.user.perfilId === 'number' ? data.user.perfilId : null,
      perfilNombre:
        typeof data.user.perfilNombre === 'string' ? data.user.perfilNombre : null,
      permissions: Array.isArray(data.user.permissions)
        ? data.user.permissions.map((permission: unknown) => String(permission))
        : [],
    };
  } catch {
    return null;
  }
}

export function useAuthMe() {
  return useQuery({
    queryKey: ['auth-me'],
    queryFn: fetchAuthMe,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });
}
