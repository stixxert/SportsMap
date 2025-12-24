type StoreStateType = "available" | "loading";

export interface StoreAvailabilityState {
  availability: string;
}

export interface StoreAvailabilityActions {
  setAvailability: (newAvailability: StoreStateType) => void;
}

export type StoreAvailabilityStore = StoreAvailabilityState &
  StoreAvailabilityActions;

export const storeAvailabilityDefaultState = {
  availability: "loading",
};

export const createAvailabilityStore = function <T>(set: T) {
  return {
    ...storeAvailabilityDefaultState,
    setAvailability: (newAvailability: StoreStateType) => (set: T) => ({
      availability: newAvailability,
    }),
  };
};
