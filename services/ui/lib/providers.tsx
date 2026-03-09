"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { useHotkeys } from "@/lib/hooks/use-hotkeys";

function HotkeyProvider({ children }: { children: React.ReactNode }) {
  useHotkeys();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5_000,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HotkeyProvider>{children}</HotkeyProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
