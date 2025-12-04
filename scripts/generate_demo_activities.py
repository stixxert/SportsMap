import argparse
import dataclasses
import json
import uuid
from copy import deepcopy
from datetime import datetime, timedelta
from typing import Tuple, List
import numpy as np
from math import cos, sin, radians, sqrt
import polyline

@dataclasses.dataclass
class Point:
    x: float
    y: float

    def to_tuple(self) -> Tuple[float, float]:
        return self.x, self.y

@dataclasses.dataclass
class PolyLine:
    points: List[Point]

    def points_to_tuple(self) -> List[Tuple[float, float]]:
        return [point.to_tuple() for point in self.points]

@dataclasses.dataclass
class Map:
    id: str
    summary_polyline: str

@dataclasses.dataclass
class Activity:
    id: str
    name: str
    startDate: int
    distance: float
    totalElevationGain: float
    type: str
    map: Map

rng = np.random.default_rng()

WORLD_CENTER: Point = Point(0, 0)

M_TO_LAT = 10 / 111_111

# Returns (x, y) of end point of line described by origin -> (x, y)
def generate_point_from_origin(origin: Point, max_len: float = 3) -> Point:
    # [45, 180]
    rand_angle = rng.uniform(np.pi / 8, 2 * np.pi)

    distance = rng.uniform(min(max_len, 1), max_len)

    pos_x = origin.x + distance * np.cos(rand_angle)
    pos_y = origin.y + distance * np.sin(rand_angle)

    return Point(pos_x, pos_y)


def generate_polyline(origin: Point, max_dist_from_origin: float = 90, num_lines: int = 3,
                      max_len_per_line: float = 1) -> PolyLine:
    points: List[Point] = []

    x1 = rng.uniform(origin.x - max_dist_from_origin, origin.x + max_dist_from_origin)
    y1 = rng.uniform(origin.y - max_dist_from_origin, origin.x + max_dist_from_origin)

    points.append(Point(x1, y1))

    for i in range(1, num_lines):
        points.append(generate_point_from_origin(points[i - 1], max_len_per_line))

    return PolyLine(points)

def get_m_to_lon(lat: float) -> float:
    return M_TO_LAT * cos(radians(lat))


def random_shift_point(point: Point, max_dist: float) -> Point:
    m_to_lon = get_m_to_lon(point.x)

    dist = max_dist * sqrt(rng.uniform(0, 1))

    angle = rng.uniform(0, 2 * np.pi)

    x_dist = cos(angle) * dist * M_TO_LAT
    y_dist = sin(angle) * dist * m_to_lon

    return Point(point.x + x_dist, point.y + y_dist)

def random_shift_polyline(poly_line: PolyLine) -> PolyLine:
    newPolyLine: PolyLine = PolyLine([])

    for point in poly_line.points:
        newPolyLine.points.append(random_shift_point(point, max_dist=1))

    return newPolyLine

def generate_random_polygon_from_polyline(poly_line: PolyLine, max_len: int = 3, randomise_polyline: bool = False) -> PolyLine:
    new_polyline = deepcopy(poly_line.points)

    num_points = len(new_polyline) + rng.integers(2, 20, endpoint=True)

    start_choice = rng.integers(0, 1, endpoint=True)
    start_index = 0 if start_choice < 1 else -1  # start or end of point list

    if randomise_polyline:
        for i, point in enumerate(new_polyline):
            new_polyline[i] = random_shift_point(point, 5)

    last_point = new_polyline[start_index]
    for _ in range(len(new_polyline), num_points):
        point = generate_point_from_origin(last_point, max_len)
        new_polyline.append(point)
        last_point = point

    close_index = 0 if start_choice > 0 else -1
    new_polyline.append(new_polyline[close_index])

    return PolyLine(new_polyline)

def generate_n_polygons_from_polyline(polyline: PolyLine, num_polygons: int, max_len: int = 10) -> List[PolyLine]:
    generated_polygons: List[PolyLine] = []

    for _ in range(num_polygons):
        generated_polygons.append(generate_random_polygon_from_polyline(polyline, max_len=max_len))

    return generated_polygons

def generate_num_activities_and_write_to_file(filename: str, num_activities: int):
    remaining_num = num_activities

    activities = []

    while remaining_num > 0:
        numPolyLineActivities = rng.integers(0, remaining_num, endpoint=True)

        remaining_num -= numPolyLineActivities

        polyLine = generate_polyline(WORLD_CENTER, 45, max_len_per_line=1)

        for _ in range(numPolyLineActivities):

            numDuplicatePolyLine = rng.integers(0, remaining_num, endpoint=True)

            remaining_num -= numDuplicatePolyLine

            polyLineCommonDistance = rng.uniform(2, 100)
            polyLineCommonElevation = rng.uniform(0, 1000)

            for _ in range(numDuplicatePolyLine + 1):
                shuffledPolyline = random_shift_polyline(polyLine)
                activityId = str(uuid.uuid4())

                activity: Activity = Activity(
                            id=activityId,
                            name=f"Activity {len(activities)}",
                            type="Run",
                            startDate=int((datetime.now() - timedelta(days=rng.uniform(-30, 30))).timestamp()),
                            distance=polyLineCommonDistance,
                            totalElevationGain=polyLineCommonElevation,
                            map=Map(
                                id=activityId,
                                summary_polyline=polyline.encode(shuffledPolyline.points_to_tuple())
                            ),
                        )

                activities.append(dataclasses.asdict(activity))

    with open(filename, "w") as fileHandle:
        json.dump(activities, fileHandle, indent=4)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("filename", help="File to output data.")

    parser.add_argument("-n", "--num", type=int, default=30, help="Number of activities to generate.")

    args = parser.parse_args()

    generate_num_activities_and_write_to_file(args.filename, args.num)