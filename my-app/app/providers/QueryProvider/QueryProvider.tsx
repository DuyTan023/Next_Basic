"use client";

// app/providers/QueryProvider.tsx
// Đặt file này ở app/providers/QueryProvider.tsx
// Wrap trong app/layout.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState đảm bảo mỗi request tạo QueryClient riêng (tránh shared state giữa users)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}