"use client";

import { useAuthorizationFlow } from "@features/authorization/hooks/authorization-hooks";

export default function AuthorizePage() {
  useAuthorizationFlow();

  return <></>;
}
