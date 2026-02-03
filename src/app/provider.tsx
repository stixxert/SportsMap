"use client";

import React from "react";

import { AppRouterCacheProvider as MUIProvider } from "@mui/material-nextjs/v15-appRouter";
import dynamic from "next/dynamic";

import { usePageReloadOnUnfreeze } from "@/src/hooks/page-unfreeze-reload";

const CacheProvider = dynamic(() => import("@/providers/CacheProvider"), {
  ssr: false,
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  usePageReloadOnUnfreeze();
  return (
    <MUIProvider>
      <CacheProvider>{children}</CacheProvider>
    </MUIProvider>
  );
}
