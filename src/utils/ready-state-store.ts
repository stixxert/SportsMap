import * as zustand from "zustand";

export interface ReadinessState {
  ready: boolean | undefined;
}

export interface ReadinessActions {
  setReady: (ready: boolean) => void;
}

export type ReadinessStore = ReadinessState & ReadinessActions;

const defaultReadinessState: ReadinessState = {
  ready: undefined,
};

function setReady<T extends (arg: Partial<ReadinessStore>) => void>(set: T) {
  return {
    setReady: (ready: ReadinessState["ready"]) => {
      set({ ready });
    },
  };
}

export function createReadinessStore() {
  return zustand.create<ReadinessStore>((set) => ({
    ...defaultReadinessState,
    ...setReady(set),
  }));
}

export function embedReadinessStore<
  T extends (arg: Partial<ReadinessStore>) => void,
>(set: T) {
  return {
    ...defaultReadinessState,
    ...setReady(set),
  };
}
