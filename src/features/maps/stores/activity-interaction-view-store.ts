import * as zustand from "zustand";

import { SummaryActivity } from "@/strava-api";
import { createAvailabilityStore, StoreAvailabilityStore } from "@/utils/store";
import { useMapInteractionStore } from "@/features/maps/stores/map-interaction-store";
import { updateActivitiesInViewCallback } from "@/features/maps/lib/map-view";
import { useGeospatialIndexStore } from "@/features/maps/stores/geospatial-store";

interface ActivityInteractionViewState {
  activityView: SummaryActivity[] | null;
}

interface ActivityInteractionViewActions {
  setActivityView: (activityView: SummaryActivity[] | null) => void;
}

type ActivityInteractionViewStore = ActivityInteractionViewState &
  ActivityInteractionViewActions;

export const useActivityInteractionViewStore = zustand.create<
  ActivityInteractionViewStore & StoreAvailabilityStore
>((set) => ({
  ...createAvailabilityStore(set),
  activityView: null,
  setActivityView: (activityView: SummaryActivity[] | null) =>
    set({ activityView: activityView }),
}));

useMapInteractionStore.subscribe((state, prevState) => {
  if (
    state.interaction === prevState.interaction &&
    state.value === prevState.value
  )
    return;

  updateActivitiesInViewCallback();
});

useGeospatialIndexStore.subscribe((state, prevState) => {
  if (state.activityView === prevState.activityView) return;

  updateActivitiesInViewCallback();
});
