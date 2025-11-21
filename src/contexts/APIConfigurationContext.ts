"use client";

import { Configuration } from "@/strava-api";
import { createContext, useContext } from "react";

export const APIConfigurationContext = createContext<Configuration>(
  new Configuration(),
);

export function useConfigurationContext() {
  return useContext(APIConfigurationContext);
}
