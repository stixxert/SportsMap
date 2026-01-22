import * as zustand from "zustand";

import { SummaryActivity } from "@/strava-api";
import { createAvailabilityStore, AvailabilityStore } from "@/utils/store";
import { useMapInteractionStore } from "@/features/maps/stores/map-interaction-store";
import { updateActivitiesInViewCallback } from "@/features/maps/lib/map-view";
import { useFilterAggregationProcessingStore } from "@/features/activity-filter/stores/active-filter-store";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import { updateIndexWithMarshalling } from "@/features/maps/lib/spatial/dispatch-worker";

interface ActivityInteractionViewState {
  activityView: SummaryActivity[] | null;
}

interface ActivityInteractionViewActions {
  setActivityView: (activityView: SummaryActivity[] | null) => void;
}

type ActivityInteractionViewStore = ActivityInteractionViewState &
  ActivityInteractionViewActions;

export const useActivityInteractionViewStore = zustand.create<
  ActivityInteractionViewStore & AvailabilityStore
>((set) => ({
  ...createAvailabilityStore(set),
  activityView: null,
  setActivityView: (activityView: SummaryActivity[] | null) =>
    set({ activityView: activityView }),
}));

useMapInteractionStore.subscribe((state, prevState) => {
  if (
    state.interaction === "mapview" &&
    state.interaction === prevState.interaction &&
    state.value === prevState.value
  )
    return;

  void updateActivitiesInViewCallback();
});

useFilterAggregationProcessingStore.subscribe(() =>
  updateIndexWithMarshalling(),
);
useApiTypeStore.subscribe(() => updateIndexWithMarshalling());
