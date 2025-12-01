// app/ReactQueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';

// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // opcional

type Props = {
  children: ReactNode;
};

export function ReactQueryProvider({ children }: Props) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools opcional
      <ReactQueryDevtools initialIsOpen={false} /> 
      */}
    </QueryClientProvider>
  );
}
