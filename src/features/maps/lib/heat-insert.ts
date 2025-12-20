import { SummaryActivity } from "@/strava-api";

import L from "leaflet";
import "leaflet.heat";
import { reduceActivitiesToPoints } from "@/features/maps/lib/points-utils";

export async function paintActivitiesOnHeatLayer(
  heatLayer: L.HeatLayer,
  activities: Promise<SummaryActivity[]> | SummaryActivity[],
) {
  const activitiesUnwrapped =
    activities instanceof Promise ? await activities : activities;

  const points = reduceActivitiesToPoints(activitiesUnwrapped);

  console.log("Entering benchmark");
  const start = performance.now();
  heatLayer.setLatLngs(points);
  const end = performance.now();

  console.log("That took: " + (end - start));
}
