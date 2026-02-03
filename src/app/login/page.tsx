"use client";

import { useAuthorizationFlow } from "@/lib/auth/authenticate";

export default function AuthorizePage() {
  useAuthorizationFlow();

  return <></>;
}
