import React from "react";

import { AppRouterCacheProvider as MUIProvider } from "@mui/material-nextjs/v15-appRouter";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MUIProvider>{children}</MUIProvider>;
}
