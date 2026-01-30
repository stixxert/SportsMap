import dynamic from "next/dynamic";

const CacheProvider = dynamic(() => import("@/providers/CacheProvider"), {
  ssr: false,
});

import { ReactNode } from "react";

export function ClientSideProvider({ children }: { children: ReactNode }) {
  return <CacheProvider>{children}</CacheProvider>;
}
