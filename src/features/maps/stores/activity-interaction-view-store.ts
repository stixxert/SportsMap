import * as zustand from "zustand";

import { SummaryActivity } from "@/src/generated/strava-api";
import { useMapInteractionStore } from "@/features/maps/stores/map-interaction-store";
import { updateActivitiesInViewCallback } from "@/features/maps/lib/map-view";
import { useFilterProcessingResults } from "@/lib/filter/active-filter-store";
import { useApiTypeStore } from "@/lib/auth/api-store";
import { updateIndexWithMarshalling } from "@/features/maps/lib/spatial/dispatch-worker";

export interface ActivityInteractionViewState {
  activityView: SummaryActivity[] | null;
}

interface ActivityInteractionViewActions {
  setActivityView: (activityView: SummaryActivity[] | null) => void;
}

type ActivityInteractionViewStore = ActivityInteractionViewState &
  ActivityInteractionViewActions;

export const useActivityInteractionViewStore =
  zustand.create<ActivityInteractionViewStore>((set) => ({
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

useFilterProcessingResults.subscribe(() => updateIndexWithMarshalling());
useApiTypeStore.subscribe(() => updateIndexWithMarshalling());
