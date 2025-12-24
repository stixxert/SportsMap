import * as zustand from "zustand";

import { LatLng, LatLngBounds } from "leaflet";

export type InteractionType = "mapview" | "point";

interface MapInteractionState {
  interaction: InteractionType | null;
  value: LatLngBounds | LatLng | null;
}

interface MapInteractionActions {
  setInteractionState: (interaction: MapInteractionState) => void;
}

type MapInteractionStore = MapInteractionState & MapInteractionActions;

export const useMapInteractionStore = zustand.create<MapInteractionStore>(
  (set) => ({
    interaction: null,
    value: null,
    setInteractionState: (interaction: MapInteractionState) =>
      set({ interaction: interaction.interaction, value: interaction.value }),
  }),
);
