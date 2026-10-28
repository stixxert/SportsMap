import * as zustand from "zustand";
import { createRef, RefObject } from "react";
import { Map } from "leaflet";

interface MapState {
  map: RefObject<Map | null>;
}

const useMapStore = zustand.create<MapState>(() => ({
  map: createRef<Map>(),
}));

export function useMap() {
  return useMapStore((state) => state.map);
}

export function getMap() {
  return useMapStore.getState().map;
}

export function setMapCurrent(map: Map | null) {
  useMapStore.getState().map.current = map;
}
