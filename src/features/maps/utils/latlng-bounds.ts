"use client";

import { LatLng, LatLngBounds } from "leaflet";
import { BBox } from "rbush";

import { getZoomDistanceSensitivity } from "@/features/maps/lib/map-view";
import { Point } from "@/types/geo";

export function getBoundsSearchBox(bounds: LatLngBounds): BBox | BBox[] {
  function getWidth(west: number, east: number): number {
    const _east = east < west ? east + 360 : east;

    return _east - west;
  }

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const south = sw.lat;
  const north = ne.lat;

  /* if viewport covers more than one rotation around the globe, clamp to one rotation */
  if (getWidth(sw.lng, ne.lng) >= 360 - 0.01)
    return { minX: south, minY: -180, maxX: north, maxY: 180 };

  const wrapWest = sw.wrap().lng;
  const wrapEast = ne.wrap().lng;

  /* no antimeridian crossing */
  if (wrapWest < wrapEast)
    return { minX: south, minY: wrapWest, maxX: north, maxY: wrapEast };

  /* crosses the antimeridian: split into two boxes */
  return [
    { minX: south, minY: wrapWest, maxX: north, maxY: 180 },
    { minX: south, minY: -180, maxX: north, maxY: wrapEast },
  ];
}

export function getPointBounds(point: LatLng, zoomLevel: number): LatLngBounds {
  const distance = getZoomDistanceSensitivity(zoomLevel) * 2;

  return point.toBounds(distance);
}

export function convLatLngToPoint(latLng: LatLng): Point {
  return [latLng.lat, latLng.lng];
}
