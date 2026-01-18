import { LatLngTuple } from "leaflet";
import { M_PER_DEG_LAT, M_PER_DEG_LNG_EQ } from "@/utils/geo";
import { randomBetween } from "@/utils/misc";

interface PolygonOptions {
  center: LatLngTuple;
  radiusInMeters: number;
  numberOfPoints: number;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function destinationPoint(
  start: LatLngTuple,
  bearingDegrees: number,
  distanceMeters: number,
): LatLngTuple {
  const mPerDegLon = M_PER_DEG_LNG_EQ * Math.cos(toRadians(start[0]));

  const bearingRad = toRadians(bearingDegrees);

  const delta: LatLngTuple = [
    distanceMeters * Math.cos(bearingRad),
    distanceMeters * Math.sin(bearingRad),
  ];

  return [
    start[0] + delta[0] / M_PER_DEG_LAT,
    start[1] + delta[1] / mPerDegLon,
  ];
}

function generatePolygon(options: PolygonOptions): LatLngTuple[] {
  const { center, radiusInMeters, numberOfPoints } = options;

  const points: LatLngTuple[] = [];
  const angleStep = 360 / numberOfPoints;

  for (let i = 0; i < numberOfPoints; i++) {
    // Base angle with some irregularity
    const angleVariation = (Math.random() - 0.5) * angleStep;
    const angle = i * angleStep + angleVariation;

    // Radius variation for natural look
    const radiusVariation = 1 + (Math.random() - 0.5);
    const pointRadius = radiusInMeters * radiusVariation;

    // Calculate the point
    const point = destinationPoint(center, angle, pointRadius);

    points.push(point);
  }

  // Close the polygon by adding the first point at the end
  points.push({ ...points[0] });

  return points;
}

export function generateActivityMap(options: PolygonOptions): LatLngTuple[] {
  const points = generatePolygon({
    ...options,
  });

  // Add intermediate points for more realistic GPS tracking
  const detailedPoints: LatLngTuple[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    detailedPoints.push(points[i]);

    // Add 2-4 intermediate points between each vertex
    const intermediateCount = 2 + Math.floor(Math.random() * 3);
    for (let j = 1; j <= intermediateCount; j++) {
      const fraction = j / (intermediateCount + 1);
      const intermediate: LatLngTuple = [
        points[i][0] + (points[i + 1][0] - points[i][0]) * fraction,
        points[i][1] + (points[i + 1][1] - points[i][1]) * fraction,
      ];
      // Add noise to intermediate points
      detailedPoints.push(intermediate);
    }
  }

  detailedPoints.push(points[points.length - 1]);
  return detailedPoints;
}

const RANDOM_BOUNDS = [-160, 160];
const RANDOM_RADIUS_BOUNDS = [500, 20000];
const RANDOM_NUM_POINTS_BOUNDS = [10, 100];

export function generateRandomActivityMap(): {
  options: PolygonOptions;
  map: LatLngTuple[];
} {
  const center: LatLngTuple = [
    randomBetween(RANDOM_BOUNDS[0], RANDOM_BOUNDS[1]),
    randomBetween(RANDOM_BOUNDS[0], RANDOM_BOUNDS[1]),
  ];

  const radiusInMeters = randomBetween(
    RANDOM_RADIUS_BOUNDS[0],
    RANDOM_RADIUS_BOUNDS[1],
  );

  const numberOfPoints = randomBetween(
    RANDOM_NUM_POINTS_BOUNDS[0],
    RANDOM_NUM_POINTS_BOUNDS[1],
  );

  const options = {
    center,
    radiusInMeters,
    numberOfPoints,
  };

  return { options, map: generateActivityMap(options) };
}
