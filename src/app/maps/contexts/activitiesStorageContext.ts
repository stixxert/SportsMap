"use client";

import { createContext, useContext } from "react";

export const ActivitiesStorageContext = createContext({});

export function useActivitiesStorageContext() {
  return useContext(ActivitiesStorageContext);
}
