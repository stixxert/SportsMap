"use client";

import { BBox } from "rbush";
import { usePointSensitivityStore } from "@/features/maps/stores/map-interaction-store";
import { Point } from "@/types/types";

export function getZoomDistanceSensitivityNoLookup(
  searchSensitivity: number,
  zoomLevel: number,
) {
  return searchSensitivity * (15 - zoomLevel) ** 3;
}

export function getZoomDistanceSensitivity(zoomLevel: number) {
  return getZoomDistanceSensitivityNoLookup(
    usePointSensitivityStore.getState().pointSensitivity,
    zoomLevel,
  );
}

export function lineSegmentToLatLng<T extends BBox>(lineSegment: T): Point[] {
  return [
    [lineSegment.minX, lineSegment.minY],
    [lineSegment.maxX, lineSegment.maxY],
  ];
}
