import {
  BaseHeatTile,
  BaseHeatTileDataIndex,
  BaseHeatTileDataObject,
  TileBounds,
} from "@/features/activity-aggregation/heat-tiles/types";
import { toDegrees, toRadians } from "@/utils/unit";
import { ZOOM_BOUNDS } from "@/config/map";

import lineclip from "lineclip";
import bresenham from "bresenham";
import RBush from "rbush";
import { Point } from "@/types/types";

const TILE_SIZE = 256;

const _nTilesMaxZoom = Math.pow(2, ZOOM_BOUNDS.max);

/* https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames */
function latLngToTile(
  latLng: Point,
  zoomLevel: number = ZOOM_BOUNDS.max,
): Point {
  const nTiles =
    zoomLevel === ZOOM_BOUNDS.max ? _nTilesMaxZoom : Math.pow(2, zoomLevel);

  function lngToTile(lng: number) {
    const xTile = ((lng + 180) / 360) * nTiles;

    return Math.floor(xTile);
  }

  function latToTile(lat: number) {
    const latRad = toRadians(lat);

    const yTile =
      (nTiles *
        (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) /
      2;

    return Math.floor(yTile);
  }

  return [lngToTile(latLng[1]), latToTile(latLng[0])];
}

function tileToBounds(
  tile: Point,
  zoomLevel: number = ZOOM_BOUNDS.max,
): TileBounds {
  const nTiles =
    zoomLevel === ZOOM_BOUNDS.max ? _nTilesMaxZoom : Math.pow(2, zoomLevel);

  function tileToLng(xTile: number) {
    return (xTile / nTiles) * 360 - 180;
  }

  function tileToLat(yTile: number) {
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * yTile) / nTiles)));
    return toDegrees(latRad);
  }

  return [
    tileToLat(tile[1]),
    tileToLng(tile[0]),
    tileToLat(tile[1] + 1),
    tileToLng(tile[0] + 1),
  ];
}

function getPolygonBounds(polygon: Point[]): [Point, Point] {
  const lats = polygon.map(([lat]) => lat);
  const lngs = polygon.map(([, lng]) => lng);

  const minLat = Math.min(...lats);
  const minLng = Math.min(...lngs);

  const maxLat = Math.max(...lats);
  const maxLng = Math.max(...lngs);

  const topLeft = latLngToTile([maxLat, minLng]);
  const bottomRight = latLngToTile([minLat, maxLng]);

  return [topLeft, bottomRight];
}

function clipPolygonToTile(polygon: Point[], tileBbox: TileBounds) {
  const results: Point[][] = [];
  lineclip(polygon, tileBbox, results);

  return results;
}

function latLngToTilePosition(latLng: Point, tileBounds: TileBounds): Point {
  const x =
    ((latLng[1] - tileBounds[1]) / (tileBounds[3] - tileBounds[1])) * TILE_SIZE;
  const y =
    ((tileBounds[2] - latLng[0]) / (tileBounds[2] - tileBounds[0])) * TILE_SIZE;

  return [x, y];
}

function paintTile(
  polygon: Point[],
  tile: Point,
  zoomLevel: number = ZOOM_BOUNDS.max,
): BaseHeatTile | undefined {
  const tileBbox = tileToBounds(tile, zoomLevel);

  const clippedPolygon = clipPolygonToTile(polygon, tileBbox);

  const heatTile: BaseHeatTile = [];

  if (clippedPolygon.length === 0) return undefined;

  for (const line of clippedPolygon) {
    const pos = line.map((pt) => latLngToTilePosition(pt, tileBbox));

    bresenham(
      pos[0][1],
      pos[0][1],
      pos[1][0],
      pos[1][1],
      (x, y) =>
        ((heatTile[x] = heatTile[x] || [])[y] = (heatTile[x][y] || 0) + 1),
    );
  }

  return heatTile;
}

export function getTileIndexEntry(
  tilePos: Point,
  tileData: BaseHeatTile,
): BaseHeatTileDataObject {
  return {
    minX: tilePos[0],
    minY: tilePos[1],
    maxX: tilePos[0],
    maxY: tilePos[1],
    data: tileData,
  };
}

function polygonGenerateTiles(
  polygon: Point[],
  zoomLevel: number = ZOOM_BOUNDS.max,
): BaseHeatTileDataIndex {
  const polygonBounds = getPolygonBounds(polygon);

  const heatTiles: BaseHeatTileDataObject[] = [];

  for (let x = polygonBounds[0][0]; x < polygonBounds[1][0]; x++) {
    for (let y = polygonBounds[0][1]; y < polygonBounds[1][1]; y++) {
      const heatTile = paintTile(polygon, [x, y], zoomLevel);

      if (!heatTile) continue;

      const wrappedHeatTile = getTileIndexEntry([x, y], heatTile);

      heatTiles.push(wrappedHeatTile);
    }
  }

  const index = new RBush<BaseHeatTileDataObject>();

  index.load(heatTiles);

  return index;
}
