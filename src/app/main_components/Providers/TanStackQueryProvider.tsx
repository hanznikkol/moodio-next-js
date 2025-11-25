'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useRef } from 'react';

export default function TanStackQueryProvider({ children }: { children: ReactNode }) {
  const queryClientRef = useRef(new QueryClient());
  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
