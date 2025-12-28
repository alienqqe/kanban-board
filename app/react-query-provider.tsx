'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { ReactNode, useState } from 'react'

type Props = {
  children: ReactNode
}

// Provides a stable QueryClient instance for the app.
export function ReactQueryProvider({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
