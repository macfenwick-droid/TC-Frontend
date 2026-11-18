"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";

/** Client-side providers shared by every page. */
export function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per browser session (not module-level, so server renders never share it).
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
