"use client";

import React from "react";

import { AppRouterCacheProvider as MUIProvider } from "@mui/material-nextjs/v15-appRouter";

import { usePageReloadOnUnfreeze } from "@/src/hooks/page-unfreeze-reload";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  usePageReloadOnUnfreeze();
  return <MUIProvider>{children}</MUIProvider>;
}
