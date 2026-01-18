import { ActivityStoreSchema } from "@/features/activity/lib/data/schema";
import { DBSchema } from "idb";
import { AggregatedIndexesSchema } from "@/features/activity-aggregation/lib/schema";

export type ActivityOriginSchema = DBSchema &
  ActivityStoreSchema &
  AggregatedIndexesSchema;
