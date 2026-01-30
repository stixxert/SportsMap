"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";

function localStorageProvider() {
  const map = new Map<string, object>(
    JSON.parse(localStorage.getItem("app-cache") || "[]"),
  );

  window.addEventListener("beforeunload", () => {
    const cache = JSON.stringify(Array.from(map.entries()));

    localStorage.setItem("app-cache", cache);
  });

  return map;
}

export default function CacheProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ provider: localStorageProvider }}>{children}</SWRConfig>
  );
}
