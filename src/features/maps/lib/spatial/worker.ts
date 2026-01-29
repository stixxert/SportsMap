import * as Comlink from "comlink";
import { spatialIndexWorkerActions } from "@/features/maps/lib/spatial/worker-actions";

Comlink.expose(spatialIndexWorkerActions);
