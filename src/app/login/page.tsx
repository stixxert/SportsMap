"use client";

import { useAuthorizationFlow } from "@/features/auth/hooks/authorization-hooks";

export default function AuthorizePage() {
  useAuthorizationFlow();

  return <></>;
}
