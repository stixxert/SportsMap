import {
  AggregationTask,
  AggregationTaskResult,
} from "@/features/activity-aggregation/types/aggregation";
import { constructWorkerMessageHandler } from "@/features/activity-aggregation/lib/dispatch-aggregate";

class AggregationMockWorker implements Worker {
  onmessage = (event: MessageEvent<AggregationTaskResult>) => {};
  constructor() {}
  terminate(): void {
    throw new Error("Method not implemented.");
  }
  addEventListener(type: unknown, listener: unknown, options?: unknown): void {
    throw new Error("Method not implemented.");
  }
  removeEventListener(
    type: unknown,
    listener: unknown,
    options?: unknown,
  ): void {
    throw new Error("Method not implemented.");
  }
  onerror(this: AbstractWorker, ev: ErrorEvent) {
    throw new Error("Method not implemented.");
  }
  onmessageerror(this: Worker, ev: MessageEvent) {
    throw new Error("Method not implemented.");
  }
  dispatchEvent(event: unknown): boolean {
    throw new Error("Method not implemented.");
  }

  async postMessage(message: AggregationTask) {
    const _postMessage = (result: AggregationTaskResult) => {
      if (this.onmessage) {
        this.onmessage({
          data: result,
        } as MessageEvent<AggregationTaskResult>);
      }
    };

    const msgHandler = constructWorkerMessageHandler(_postMessage);
    await msgHandler({ data: message } as MessageEvent<AggregationTask>);
  }
}

export default AggregationMockWorker;
