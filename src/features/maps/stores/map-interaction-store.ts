import * as zustand from "zustand";

import { LatLng, LatLngBounds } from "leaflet";
import { POINT_SEARCH_SENSITIVITY } from "@/features/maps/config/consts";

export type InteractionType = "mapview" | "point";

export type PointInteraction = {
  point: LatLng;
  zoomLevel: number;
};

export interface MapInteractionState {
  interaction: InteractionType | null;
  value: LatLngBounds | PointInteraction | null;
}

interface MapInteractionActions {
  setInteractionState: (interaction: MapInteractionState) => void;
  setPointInteraction: (interaction: PointInteraction) => void;
}

type MapInteractionStore = MapInteractionState & MapInteractionActions;

export const useMapInteractionStore = zustand.create<MapInteractionStore>(
  (set) => ({
    interaction: null,
    value: null,
    setInteractionState: (interaction: MapInteractionState) =>
      set({ interaction: interaction.interaction, value: interaction.value }),
    setPointInteraction: (interaction: PointInteraction) =>
      set({ interaction: "point", value: interaction }),
  }),
);

interface PointSensitivityState {
  pointSensitivity: number;
}

interface PointSensitivityActions {
  setPointSensitivity: (sensitivity: number) => void;
}

type PointSensitivityStore = PointSensitivityState & PointSensitivityActions;

export const usePointSensitivityStore = zustand.create<PointSensitivityStore>(
  (set) => ({
    pointSensitivity: POINT_SEARCH_SENSITIVITY,
    setPointSensitivity: (sensitivity: number) =>
      set({ pointSensitivity: sensitivity }),
  }),
);
