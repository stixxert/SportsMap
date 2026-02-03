import * as React from "react";

import Box from "@mui/material/Box";
import { SportType } from "@/strava-api";
import { useSetActivityFilter } from "@/lib/filter/active-filter-store";
import { MAX_UPPER_BOUNDS } from "@/utils/db";
import { ActivityAggregationSelector } from "@/types/activity-selection";

interface SportTypeFilter {
  displayName: string;
  sportType: SportType;
}

const excludeSports: SportType[] = [
  SportType.Crossfit,
  SportType.Elliptical,
  SportType.HighIntensityIntervalTraining,
  SportType.Pickleball,
  SportType.Pilates,
  SportType.Racquetball,
  SportType.RockClimbing,
  SportType.Squash,
  SportType.StairStepper,
  SportType.StandUpPaddling,
  SportType.TableTennis,
  SportType.Tennis,
  SportType.VirtualRun,
  SportType.VirtualRide,
  SportType.VirtualRow,
  SportType.WeightTraining,
  SportType.Workout,
  SportType.Yoga,
];

const prioritySports: SportTypeFilter[] = [
  {
    displayName: SportType.Run,
    sportType: SportType.Run,
  },
  {
    displayName: "Trail Run",
    sportType: SportType.TrailRun,
  },
  {
    displayName: "Ride",
    sportType: SportType.Ride,
  },
  {
    displayName: "Gravel Ride",
    sportType: SportType.GravelRide,
  },
  {
    displayName: "Mountain Bike Ride",
    sportType: SportType.MountainBikeRide,
  },
  {
    displayName: "E-Mountain Bike Ride",
    sportType: SportType.EMountainBikeRide,
  },
  {
    displayName: "E-Bike Ride",
    sportType: SportType.EBikeRide,
  },
  {
    displayName: "Alpine Ski",
    sportType: SportType.AlpineSki,
  },
  {
    displayName: "Backcountry Ski",
    sportType: SportType.BackcountrySki,
  },
  {
    displayName: "Nordic Ski",
    sportType: SportType.NordicSki,
  },
  {
    displayName: "Roller Ski",
    sportType: SportType.RollerSki,
  },
  {
    displayName: "Ice Skate",
    sportType: SportType.IceSkate,
  },
];

const nonPrioritySports = Object.keys(SportType).filter(
  (type) =>
    !Boolean(
      [
        ...excludeSports,
        ...prioritySports.map((sport) => sport.sportType),
      ].find((_type) => _type === type),
    ),
);

const allLabels: SportTypeFilter[] = [
  ...prioritySports,
  ...nonPrioritySports.map(
    (sport) =>
      ({
        displayName: sport,
        sportType: sport,
      }) as SportTypeFilter,
  ),
];

const defaultFilterOptions: ActivityAggregationSelector = {
  startDate: new Date(0),
  endDate: MAX_UPPER_BOUNDS.date,
  sportType: [SportType.Run, SportType.TrailRun],
};

export function FilterOptionBox() {
  const setFilter = useSetActivityFilter();
  return <Box></Box>;
}
