import { SchemaEntry } from "@/features/activity-aggregation/lib/schema";

export const FEATURE_COLLECTION_INDEX_KEY = "featureCollectionIndex";

export interface FeatureCollectionIndexSchemaEntry extends SchemaEntry {
  [FEATURE_COLLECTION_INDEX_KEY]: string;
}
