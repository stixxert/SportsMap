"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import { SummaryActivity } from "@/strava-api";
import { durationToTimeString, formatDistance } from "@/utils/unit";
import { useMappableActivitiesStore } from "@/features/activity/stores/activity-store";
import { useEffect } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const headCells: GridColDef[] = [
  {
    field: "id",
    hideSortIcons: true,
    renderHeader: () => <></>,
    renderCell: (params) => (
      <Icon sx={{ width: "100%", height: "100%", alignItems: "center" }}>
        <Tooltip title={"Open Strava activity"}>
          <a
            href={`https://www.strava.com/activities/${params.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <OpenInNewIcon fontSize={"small"} />
          </a>
        </Tooltip>
      </Icon>
    ),
  },
  {
    field: "name",
    headerName: "Name",
    minWidth: 150,
  },
  {
    field: "startDate",
    headerName: "Start time",
    minWidth: 150,
    valueFormatter: (startDate: Date | undefined) =>
      dateTimeFormatter.format(
        startDate
          ? new Date(
              startDate?.getTime() + startDate?.getTimezoneOffset() * 60 * 1000,
            )
          : new Date(0),
      ),
  },
  {
    field: "movingTime",
    headerName: "Moving time",
    minWidth: 150,
    valueFormatter: (movingTime: number | undefined) =>
      durationToTimeString(movingTime || 0),
  },
  {
    field: "distance",
    headerName: "Distance (km)",
    minWidth: 150,
    valueFormatter: (distance: number | undefined) =>
      formatDistance(distance || 0),
  },
  {
    field: "totalElevationGain",
    headerName: "Elevation gain (m)",
    minWidth: 150,
  },
];

export function NewTable() {
  const activities = useMappableActivitiesStore((state) => state.activities);

  const [loadedActivities, setLoadedActivities] = React.useState<
    SummaryActivity[]
  >([]);

  useEffect(() => {
    (async () => {
      const loaded = await activities;

      setLoadedActivities(loaded);
    })();
  });
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <DataGrid
        rows={loadedActivities}
        columns={headCells}
        autoPageSize
        autosizeOnMount
        disableColumnMenu
        disableMultipleRowSelection
        hideFooterSelectedRowCount
        autosizeOptions={{ includeHeaders: true, expand: true }}
        density={"comfortable"}
        initialState={{
          sorting: {
            sortModel: [{ field: "startDate", sort: "desc" }],
          },
        }}
      ></DataGrid>
    </Box>
  );
}
