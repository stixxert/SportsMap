"use client";

import * as Comlink from "comlink";

import { processWorkerTask } from "@/features/activity-aggregation/lib/task-aggregate";
import { AggregationWorkerActions } from "@/features/activity-aggregation/types/aggregation";

const workerActions: AggregationWorkerActions = {
  processWorkerTask,
};

Comlink.expose(workerActions);
