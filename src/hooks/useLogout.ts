'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch (error) {
      console.error('Error al cerrar sesion', error);
    } finally {
      queryClient.clear();
      router.replace('/login');
      router.refresh();
    }
  }, [queryClient, router]);
}
