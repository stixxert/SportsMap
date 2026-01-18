import { createSpatialIndexStore } from "@/features/activity-aggregation/spatial-index/store";

export const useSpatialIndexStore = createSpatialIndexStore();

export const useSpatialIndex = () =>
  useSpatialIndexStore((state) => state.index);

export const useSetSpatialIndex = () =>
  useSpatialIndexStore((state) => state.setIndex);
