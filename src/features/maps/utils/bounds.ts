import { BBox } from "rbush";
import L, { LatLng, LatLngBounds } from "leaflet";
import { usePointSensitivityStore } from "@/features/maps/stores/map-interaction-store";

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

export function lineSegmentToLatLng<T extends BBox>(lineSegment: T): LatLng[] {
  return [
    L.latLng([lineSegment.minX, lineSegment.minY]),
    L.latLng([lineSegment.maxX, lineSegment.maxY]),
  ];
}

export function getPointBounds(point: LatLng, zoomLevel: number): LatLngBounds {
  const distance = getZoomDistanceSensitivity(zoomLevel) * 2;

  return point.toBounds(distance);
}

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
