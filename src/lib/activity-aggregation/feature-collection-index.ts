import { FeatureCollection } from "geojson";
import { AggregatedIndex } from "@/types/activity-aggregation";

export function parseFeatureCollection(index: unknown): FeatureCollection {
  return JSON.parse(index as string);
}

export function aggregateIndexGetFeatureCollectionIndex(
  aggregateIndex: AggregatedIndex,
): FeatureCollection | undefined {
  const featureData = aggregateIndex.index;

  if (!featureData) return undefined;

  return parseFeatureCollection(featureData);
}
