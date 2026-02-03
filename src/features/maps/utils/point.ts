"use client";

import { BBox } from "rbush";
import { ZOOM_BOUNDS } from "@/config/map";
import { Point } from "@/types/geo";

export function calculatePointRadius(
  searchSensitivity: number,
  zoomLevel: number,
) {
  return searchSensitivity * (ZOOM_BOUNDS.max + 1 - zoomLevel) ** 3;
}

export function lineSegmentToLatLng<T extends BBox>(lineSegment: T): Point[] {
  return [
    [lineSegment.minX, lineSegment.minY],
    [lineSegment.maxX, lineSegment.maxY],
  ];
}
