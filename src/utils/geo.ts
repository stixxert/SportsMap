"use client";

import { Point } from "@/types/types";

/* https://stackoverflow.com/a/6853926 */
export function getClosestPointOnLine(linePoints: Point[], queryPoint: Point) {
  const A = queryPoint[0] - linePoints[0][0];
  const B = queryPoint[1] - linePoints[0][1];
  const C = linePoints[1][0] - linePoints[0][0];
  const D = linePoints[1][1] - linePoints[0][1];

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0)
    //in case of 0 length line
    param = dot / len_sq;

  let closestPoint: Point;

  if (param < 0) {
    closestPoint = linePoints[0];
  } else if (param > 1) {
    closestPoint = linePoints[1];
  } else {
    closestPoint = [linePoints[0][0] + param * C, linePoints[0][1] + param * D];
  }

  return closestPoint;
}

export function pointDistanceTo(a: Point, b: Point) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];

  return Math.sqrt(dx * dx + dy * dy);
}

/* https://stackoverflow.com/a/6853926 */
export function pointDistanceToLine(
  linePoints: number[][],
  queryPoint: number[],
) {
  /* const closestPoint = getClosestPointOnLine(linePoints, queryPoint);

  const dx = queryPoint[0] - closestPoint[0];
  const dy = queryPoint[1] - closestPoint[1];

  return [dx, dy]; */
  /*  return Math.sqrt(dx * dx + dy * dy); */
}

export const M_PER_DEG_LNG_EQ = 113200;
export const M_PER_DEG_LAT = 111000;

const DEG_TO_RAD = Math.PI / 180;

export function metersDistanceToLatLng(referenceLat: number, distance: number) {
  const m_per_deg_lng = M_PER_DEG_LNG_EQ * Math.cos(referenceLat * DEG_TO_RAD);

  const m_dist_lat = distance / M_PER_DEG_LAT;
  const m_dist_lng = distance / m_per_deg_lng;

  return [m_dist_lat, m_dist_lng];
}

export function latLngDistanceToMeters(
  referenceLat: number,
  latLongDistance: number[],
) {
  const m_per_deg_lng = M_PER_DEG_LNG_EQ * Math.cos(referenceLat * DEG_TO_RAD);

  const m_dist_lat = M_PER_DEG_LAT * latLongDistance[0];
  const m_dist_lng = m_per_deg_lng * latLongDistance[1];

  return Math.sqrt(m_dist_lat ** 2 + m_dist_lng ** 2);
}
