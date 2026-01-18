type LoadingType = boolean | undefined;

export interface AvailabilityState {
  loading: LoadingType;
}

export interface AvailabilityActions {
  setLoading: (loading: LoadingType) => void;
}

export type AvailabilityStore = AvailabilityState & AvailabilityActions;

export const availabilityDefaultState = {
  loading: undefined,
};

export const createAvailabilityStore = function <
  T extends (arg: Partial<AvailabilityStore>) => void,
>(set: T) {
  return {
    ...availabilityDefaultState,
    setLoading: (loading: LoadingType) =>
      set({
        loading,
      }),
  };
};
