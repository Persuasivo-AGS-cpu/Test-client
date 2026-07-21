"use client";

import { ClarityStoreProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ClarityStoreProvider>{children}</ClarityStoreProvider>;
}
