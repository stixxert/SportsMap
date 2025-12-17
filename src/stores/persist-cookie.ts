"use client";

import { StateStorage } from "zustand/middleware";
import { OptionsType } from "cookies-next";
import { deleteCookie, getCookie, setCookie } from "cookies-next/client";

export function createCookieStorage(options: OptionsType): StateStorage {
  return {
    getItem: (name: string) => {
      const value = getCookie(name, options);

      if (!value) return null;

      return JSON.stringify({
        state: JSON.parse(value),
        version: 0,
      });
    },
    setItem: (name: string, value: string) => {
      const unwrappedState = JSON.stringify(JSON.parse(value)["state"]);
      setCookie(name, unwrappedState, options);
    },
    removeItem: (name: string) => {
      deleteCookie(name, options);
    },
  };
}
