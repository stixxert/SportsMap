"use client";

import { createContext, useContext } from "react";

export const SpatialTreeStorageContext = createContext({});

export function useSpatialTreeStorageContext() {
  return useContext(SpatialTreeStorageContext);
}
