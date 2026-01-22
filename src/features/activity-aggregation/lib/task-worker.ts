import * as Comlink from "comlink";
import { processWorkerTask } from "@/features/activity-aggregation/lib/task-aggregate";

const actions = {
  processWorkerTask,
};

Comlink.expose(actions);
