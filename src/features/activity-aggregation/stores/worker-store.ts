"use client";

import { createWorkerStore } from "@/utils/worker-store-template";
import { AggregationWorkerActions } from "@/features/activity-aggregation/types/aggregation";

export const useWorkerStore = createWorkerStore<AggregationWorkerActions>();
