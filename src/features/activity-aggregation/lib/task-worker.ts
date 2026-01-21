import { constructWorkerMessageHandler } from "@/features/activity-aggregation/lib/dispatch-aggregate";

self.onmessage = constructWorkerMessageHandler(self.postMessage);
