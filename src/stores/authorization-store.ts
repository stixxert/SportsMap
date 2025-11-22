import * as zustand from "zustand";
import { SummaryAthlete } from "@/strava-api";
import { AccessToken } from "@/src/types/types";

interface AthleteState {
  athlete: SummaryAthlete | null;
  setAthleteInfo: (athleteInfo: SummaryAthlete | null) => void;
}

interface AccessTokenState {
  accessToken: AccessToken | null;
  setAccessToken: (accessToken: AccessToken | null) => void;
}

export const useAthleteInfoStore = zustand.create<AthleteState>((set) => ({
  athlete: null,
  setAthleteInfo: (athleteInfo: SummaryAthlete | null) =>
    set(() => ({
      athlete: athleteInfo,
    })),
}));

export const useAccessTokenStore = zustand.create<AccessTokenState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken: AccessToken | null) =>
    set(() => ({
      accessToken: accessToken,
    })),
}));
