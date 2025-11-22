"use client";

import React from "react";
import { useAuthorizationCookies } from "@/src/hooks/client-authorization-state";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthorizationCookies();

  return <>{children}</>;
}
