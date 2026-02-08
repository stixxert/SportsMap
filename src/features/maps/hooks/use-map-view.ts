import { useEffect, useRef } from "react";
import { createActivityVectorGrid } from "@/features/maps/lib/activity-map-features";
import { useMap } from "@/features/maps/stores/map-store";
import L from "leaflet";

import useSWRImmutable from "swr/immutable";
import { fetchLocation } from "@/features/maps/lib/location-query";
import { setMapBoundsAsView } from "@/features/maps/lib/map-view";
import { useSpatialIndexReadinessStore } from "@/features/maps/lib/spatial/dispatch-worker";
import {
  useActivityFilter,
  useFilterProcessingResultsStatus,
} from "@/lib/filter/active-filter-store";
import { useApiType } from "@/lib/auth/api-store";
import { openActivityDatabase } from "@/lib/activity/db";
import { AggregationCategory } from "@/types/activity-aggregation";
import { getAggregatedData } from "@/lib/activity-aggregation/aggregation-schema";
import { ProfileState, useProfile } from "@/src/hooks/user-profile";
import { aggregateIndexGetFeatureCollectionIndex } from "@/lib/activity-aggregation/feature-collection-index";

/* Timing issue; start(or any?) index update does not update map */
export function useInitialMapView() {
  const map = useMap();
  const initialPlacementDone = useRef(false);

  const viewReady = useAthleteLocationAsSpawnView();

  const spatialIndexReady = useSpatialIndexReadinessStore(
    (state) => state.ready,
  );

  useEffect(() => {
    if (initialPlacementDone.current) return;

    if (!map.current) return;

    if (!spatialIndexReady) return;

    if (!viewReady) return;

    setMapBoundsAsView(map.current);
    initialPlacementDone.current = true;
  }, [map, spatialIndexReady, viewReady]);
}

export function useActivitiesOnMap() {
  const map = useMap();

  const apiType = useApiType();

  const activityLayer = useRef<L.VectorGrid | null>(null);

  const filterProcessingResultsReady = useFilterProcessingResultsStatus();

  const activityFilter = useActivityFilter();

  useEffect(() => {
    const updateMapFeatures = async () => {
      if (!map.current) return;

      if (!filterProcessingResultsReady) return;

      if (!apiType) return;

      const db = await openActivityDatabase(apiType);

      const aggregatedData = await getAggregatedData(
        db,
        AggregationCategory.FeatureCollection,
        activityFilter,
      );

      if (!aggregatedData) return;

      const featureCollection =
        aggregateIndexGetFeatureCollectionIndex(aggregatedData);

      if (!featureCollection) return;

      const layer = createActivityVectorGrid(map.current, featureCollection);

      if (!layer) return;

      activityLayer.current = layer;
    };

    void updateMapFeatures();

    return () => {
      if (activityLayer.current) activityLayer.current.remove();
    };
  }, [activityFilter, apiType, filterProcessingResultsReady, map]);
}

/* true: map ready. false; not */
export function useAthleteLocationAsSpawnView() {
  const hasPlacedSpawnView = useRef(false);

  const map = useMap();

  const profile = useProfile();

  const { profileUsable } = profile;

  const searchKey = dependenciesReady(profile) ? getSearchKey(profile) : null;

  const { data, error, isLoading } = useSWRImmutable(searchKey, fetchLocation);

  useEffect(() => {
    if (!data || error) return;

    if (!map.current) return;

    if (hasPlacedSpawnView.current) return;

    hasPlacedSpawnView.current = true;

    map.current.fitBounds(data);
  }, [map, data, error]);

  /* dependencies ready, no search key means no location in user profile */
  if (dependenciesReady(profile)) {
    if (searchKey === null) return true;

    return !isLoading;
  } else if (!profileUsable) return true;

  return false;

  function dependenciesReady({ user, error }: Partial<ProfileState>) {
    return Boolean(user && !error);
  }

  function getSearchKey({ user }: Partial<ProfileState>) {
    if (!user) return null;

    const { city, state, country } = user;

    if (!(city || state || country)) return null;

    return { city: city, county: state, country: country };
  }
}
