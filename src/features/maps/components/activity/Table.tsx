"use client";

import * as React from "react";
import {
  Icon,
  Tooltip,
  Box,
  Stack,
  Pagination,
  Typography,
} from "@mui/material";
import { durationToTimeString, formatDistance } from "@/utils/unit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { styled } from "@mui/material/styles";

import {
  DataGrid,
  GridColDef,
  GridFooterContainer,
  gridPageCountSelector,
  gridPageSelector,
  GridSlotsComponentsProps,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import { useActivityInteractionViewStore } from "@/features/maps/stores/activity-interaction-view-store";
import { useMapInteractionStore } from "@/features/maps/stores/map-interaction-store";

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
    align: "center",
    resizable: false,
    sortable: false,
    renderHeader: () => <></>,
    renderCell: (params) => (
      <Icon sx={{ height: "100%", alignItems: "center" }}>
        <Tooltip sx={{ textDecoration: "underline" }} title={"View on Strava"}>
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

const StyledGridOverlay = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  "& .no-rows-primary": {
    fill: "#3D4751",
    ...theme.applyStyles("light", {
      fill: "#AEB8C2",
    }),
  },
  "& .no-rows-secondary": {
    fill: "#1D2126",
    ...theme.applyStyles("light", {
      fill: "#E8EAED",
    }),
  },
}));

function NoRowsOverlay() {
  const interactionType = useMapInteractionStore((state) => state.interaction);

  return (
    <StyledGridOverlay>
      <Typography sx={{ mt: 2 }}>
        No activities{" "}
        {interactionType !== "mapview"
          ? interactionType === "point"
            ? "at selected point"
            : "in current view"
          : "in current view"}
      </Typography>
    </StyledGridOverlay>
  );
}

function ActivityTableFooter(
  props: NonNullable<GridSlotsComponentsProps["footer"]>,
) {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const viewActivities = useActivityInteractionViewStore(
    (state) => state.activityView,
  );

  const interactionType = useMapInteractionStore((state) => state.interaction);

  return (
    <GridFooterContainer
      sx={{
        position: "sticky",
        bottom: 0,
        paddingBottom: 2,
        height: "10vh",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Stack direction={"column"} spacing={1.5}>
          <Pagination
            boundaryCount={1}
            siblingCount={0}
            color="primary"
            className={props.className}
            count={pageCount}
            page={page + 1}
            onChange={(event, newPage) => apiRef.current.setPage(newPage - 1)}
          />
          {viewActivities && viewActivities.length > 0 && (
            <Typography textAlign={"center"}>
              Activities{" "}
              {interactionType !== "mapview"
                ? interactionType === "point"
                  ? "at selected point"
                  : "in current view"
                : "in current view"}
              : {viewActivities.length}
            </Typography>
          )}
        </Stack>
      </Box>
    </GridFooterContainer>
  );
}

export function ActivityTable() {
  const viewActivities = useActivityInteractionViewStore(
    (state) => state.activityView,
  );

  return (
    <DataGrid
      loading={viewActivities === null}
      rows={viewActivities || []}
      columns={headCells}
      autoPageSize
      autosizeOnMount
      disableAutosize
      disableColumnResize
      disableColumnMenu
      disableMultipleRowSelection
      hideFooterSelectedRowCount
      autosizeOptions={{ includeHeaders: true, expand: true }}
      density={"comfortable"}
      slotProps={{
        loadingOverlay: {
          variant: "skeleton",
        },
      }}
      slots={{
        noRowsOverlay: NoRowsOverlay,
        footer: ActivityTableFooter,
      }}
      sx={[
        { width: "100%", height: "100%" },
        (theme) => ({
          backgroundColor: `${theme.palette.primary.main}17`,
          borderColor: `${theme.palette.primary.main}17`,
          boxShadow: 2,

          "& .MuiDataGrid-filler": {
            display: "none",
          },

          "& .MuiDataGrid-footerContainer": {
            border: "none",
          },

          ".MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader, .MuiDataGrid-row--borderBottom .MuiDataGrid-filler, .MuiDataGrid-row--borderBottom .MuiDataGrid-scrollbarFiller":
            {
              borderBottom: "0px solid",
            },

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: `${theme.palette.primary.dark}59`,
          },

          "& .MuiDataGrid-row, .MuiDataGrid-cell": {
            backgroundColor: `${theme.palette.primary.main}17`,
          },
          "& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell": {
            borderBottom: "0px solid",
            borderTop: "0px solid",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: `${theme.palette.primary.light}66`,
            fontSize: 16,
            cursor: "pointer",
          },
          "& .MuiDataGrid-row.Mui-hovered": {
            backgroundColor: `${theme.palette.primary.light}66`,
            fontSize: 16,
            cursor: "pointer",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: `${theme.palette.primary.light}80`,
            fontSize: 16,
            cursor: "pointer",
          },
          "& .MuiDataGrid-row.Mui-selected:hover": {
            backgroundColor: `${theme.palette.primary.light}80`,
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "transparent",
          },
          "& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader": {
            backgroundColor: `${theme.palette.primary.dark}59`,
          },
          "& .MuiDataGrid-columnHeader .MuiDataGrid-sortButton": {
            backgroundColor: "transparent",
          },
          "& .MuiDataGrid-cell:focus-within": { outline: "none" },
        }),
      ]}
      initialState={{
        sorting: {
          sortModel: [{ field: "startDate", sort: "desc" }],
        },
      }}
    ></DataGrid>
  );
}
