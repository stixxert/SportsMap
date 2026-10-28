"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";

/**
 * SWR configuration only — deliberately no persistence.
 *
 * This previously serialised the whole SWR cache to `localStorage` inside a
 * `beforeunload` handler: that blocks every navigation, is unreliable on mobile Safari,
 * is capped at ~5 MB, leaked a listener per mount, and duplicated data that already
 * lives in IndexedDB. The two cached values here (athlete profile, geocoded location)
 * are cheap to refetch.
 */
export default function CacheProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
