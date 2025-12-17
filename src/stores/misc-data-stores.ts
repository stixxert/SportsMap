import * as zustand from "zustand";
import { SummaryAthlete } from "@/strava-api";

interface AthleteInfoState {
  athleteInfo: SummaryAthlete | null;
  setAthleteInfo: (athleteInfo: SummaryAthlete | null) => void;
}

export const useAthleteInfoStore = zustand.create<AthleteInfoState>((set) => ({
  athleteInfo: null,
  setAthleteInfo: (athleteInfo: SummaryAthlete | null) =>
    set(() => ({
      athleteInfo: athleteInfo,
    })),
}));
