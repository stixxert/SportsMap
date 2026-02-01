import {
  AggregationIndexerFn,
  AggregationInput,
  AggregationOutput,
} from "@/features/activity-aggregation/types/aggregation";
import { AggregatedIndex } from "@/features/activity-aggregation/lib/schema";

import { FeatureCollection } from "geojson";
import { featuresToCollection, mapPointsToFeature } from "@/utils/geo";

export const transformData: AggregationIndexerFn = (
  input: AggregationInput,
) => {
  const allActivityLines = input
    .map((activity) => mapPointsToFeature(activity.input, activity.owner))
    .filter((activity) => activity !== undefined);

  const collection = featuresToCollection(allActivityLines);

  return JSON.stringify(collection);
};

export const mergeTransformedIndexes: AggregationIndexerFn<
  AggregationOutput[]
> = (input: AggregationOutput[]) => {
  let mergedCollection: FeatureCollection | undefined = undefined;

  for (const collection of input) {
    if (!collection) continue;

    if (!mergedCollection) {
      mergedCollection = parseFeatureCollection(collection);
      continue;
    }

    const currentCollection = parseFeatureCollection(collection);

    if (!currentCollection) continue;

    mergedCollection.features.push(...currentCollection.features);
  }

  return JSON.stringify(mergedCollection ?? featuresToCollection([]));
};

export const featureCollectionAggregateHandlers = {
  aggregate: transformData,
  mergeAggregate: mergeTransformedIndexes,
};

function parseFeatureCollection(index: unknown): FeatureCollection {
  return JSON.parse(index as string);
}

export function getFeatureCollectionFromIndex(
  aggregateIndex: AggregatedIndex,
): FeatureCollection | undefined {
  const featureData = aggregateIndex.index;

  if (!featureData) return undefined;

  return parseFeatureCollection(featureData);
}
