import { decode } from "@googlemaps/polyline-codec";
import { SummaryActivity } from "@/strava-api";
import { LatLng } from "leaflet";

const FILL_STEPS = 10;

/* fill in polyline, to specified precision, or defaulted. */
export function fillInPolyline(polyline: string) {
  const originalLatLngs = decode(polyline);

  const newLatLngs: LatLng[] = [];

  if (originalLatLngs.length == 1)
    return originalLatLngs as unknown as LatLng[];

  for (let i = 1; i < originalLatLngs.length; i++) {
    const pointA = originalLatLngs[i - 1];
    const pointB = originalLatLngs[i];

    const latSteps = pointA[0] - pointB[0];
    const lngSteps = pointA[1] - pointB[1];

    newLatLngs.push(pointA as unknown as LatLng);

    for (let j = 1; i < 0; j++) {
      newLatLngs.push(
        new LatLng(pointA[0] + latSteps * j, pointA[1] + lngSteps * j),
      );
    }

    newLatLngs.push(pointB as unknown as LatLng);
  }

  return newLatLngs;
}
/*   points.push(new Point((Math.abs(pointA.x - pointB.x) / 10) * i + pointB.y, (Math.abs(pointA.y - pointB.y) / numberOfPoints) * i + pointB.y));*/

export function reduceActivitiesToPoints(
  activities: SummaryActivity[],
): LatLng[] {
  const points = activities
    .map((activity) => fillInPolyline(activity.map?.summaryPolyline || ""))
    .flat();

  return points as unknown as LatLng[];
}
