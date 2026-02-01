import { useEffect, useMemo, useRef } from "react";
import { createActivityVectorGrid } from "@/features/maps/lib/draw-activities";
import { useMap } from "@/features/maps/stores/map-store";
import L from "leaflet";
import { useProfile } from "@/features/profile/hooks/use-profile";

import useSWRImmutable from "swr/immutable";
import { fetchLocation } from "@/features/maps/lib/profile-location";
import { setMapBoundsAsView } from "@/features/maps/lib/map-view";
import { useSpatialIndexReadinessStore } from "@/features/maps/lib/spatial/dispatch-worker";
import {
  useActivityFilter,
  useFilterAggregationProcessingStatus,
} from "@/features/activity-filter/stores/active-filter-store";
import { useApiType } from "@/features/auth/stores/api-store";
import { openActivityDatabase } from "@/lib/db/origin-related-activity-db";
import { getAggregatedData } from "@/features/activity-aggregation/lib/schema";
import { AggregationTask } from "@/features/activity-aggregation/types/aggregation";
import { getFeatureCollectionFromIndex } from "@/features/activity-aggregation/map-activity-features/aggregate";

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

  const filterLoading = useFilterAggregationProcessingStatus();

  const activityFilter = useActivityFilter();

  const updateMapFeatures = async () => {
    if (!map.current) return;

    if (filterLoading === undefined && filterLoading) return;

    if (!apiType) return;

    const db = await openActivityDatabase(apiType);

    const aggregatedData = await getAggregatedData(
      db,
      AggregationTask.featureCollection,
      activityFilter,
    );

    if (!aggregatedData) return;

    const featureCollection = getFeatureCollectionFromIndex(aggregatedData);

    if (!featureCollection) return;

    const layer = createActivityVectorGrid(map.current, featureCollection);

    if (!layer) return;

    activityLayer.current = layer;
  };

  useEffect(() => {
    void updateMapFeatures();

    return () => {
      if (activityLayer.current) activityLayer.current.remove();
    };
  });
}

/* true: map ready. false; not */
export function useAthleteLocationAsSpawnView() {
  const hasPlacedSpawnView = useRef(false);

  const map = useMap();

  const { user, error: profileError, profileUsable } = useProfile();

  const dependenciesReady = user && !profileError;

  const searchKey = useMemo(() => {
    if (!dependenciesReady) return null;

    const { city, state, country } = user;

    if (!(city || state || country)) return null;

    return { city: city, county: state, country: country };
  }, [user, dependenciesReady]);

  const { data, error, isLoading } = useSWRImmutable(searchKey, fetchLocation);

  useEffect(() => {
    if (!data || error) return;

    if (!map.current) return;

    if (hasPlacedSpawnView.current) return;

    hasPlacedSpawnView.current = true;

    map.current.fitBounds(data);
  }, [map, data, error]);

  /* dependencies ready, no search key means no location in user profile */
  if (dependenciesReady) {
    if (searchKey === null) return true;

    return !isLoading;
  } else if (!profileUsable) return true;

  return false;
}
