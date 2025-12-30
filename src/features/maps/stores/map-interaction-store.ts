import * as zustand from "zustand";

import { LatLng, LatLngBounds } from "leaflet";

export type InteractionType = "mapview" | "point";

export type PointInteraction = {
  point: LatLng;
  zoomLevel: number;
};

interface MapInteractionState {
  interaction: InteractionType | null;
  value: LatLngBounds | LatLng | PointInteraction | null;
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
