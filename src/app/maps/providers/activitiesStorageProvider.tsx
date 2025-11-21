"use client";

import { APIConfigurationContext } from "@/src/contexts/APIConfigurationContext";
import React, { useMemo } from "react";
import { Configuration } from "@/strava-api";
import { Modes } from "@lib/requestModes";

export function APIConfigurationProvider({
  slug,
  children,
}: Readonly<{
  slug: string | string[] | undefined;
  children: React.ReactNode;
}>) {
  const configuration = useMemo(() => {
    if (slug === Modes.Demo) {
      console.log("demo config");
      return new Configuration({
        basePath: `${process.env.NEXT_PUBLIC_DOMAIN}/api/demo`,
      });
    } else {
      return new Configuration();
    }
  }, [slug]);

  console.log("APIConfigurationProvider", slug, configuration);

  return (
    <APIConfigurationContext value={configuration}>
      {children}
    </APIConfigurationContext>
  );
}
