'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export function useApiMutation<TData, TVars>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVars>
) {
  return useMutation<TData, Error, TVars>({
    mutationFn: async (vars: TVars) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(vars),
      });
      const data = await res.json().catch(()=> ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Error');
      return data as TData;
    },
    ...options,
  });
}
