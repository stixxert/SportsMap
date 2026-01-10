"use client";

import * as React from "react";
import { Icon, Tooltip, Typography } from "@mui/material";
import { durationToTimeString, formatDate, formatDistance } from "@/utils/unit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { styled } from "@mui/material/styles";

import { useActivityInteractionViewStore } from "@/features/maps/stores/activity-interaction-view-store";
import {
  InteractionType,
  useMapInteractionStore,
} from "@/features/maps/stores/map-interaction-store";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_RowSelectionState,
} from "material-react-table";
import { SummaryActivity } from "@/strava-api";
import { useMemo, useState } from "react";

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

function activityCount(
  activityCount: number,
  interactionType: InteractionType | null,
) {
  return `Activities
  ${
    interactionType !== "mapview"
      ? interactionType === "point"
        ? "at selected point"
        : "in current view"
      : "in current view"
  }: ${activityCount}`;
}

function useSelectedRow() {
  const [selectedRows, setSelectedRows] = useState<MRT_RowSelectionState>({});

  function _isSelectedRow(row: string) {
    return selectedRows.hasOwnProperty(row);
  }

  function _toggleSelectedRow(row: string) {
    if (_isSelectedRow(row)) {
      return setSelectedRows({});
    }
    setSelectedRows({ [row]: true });
  }

  return {
    selectedRows,
    setSelectedRows,
    toggleSelectedRow: _toggleSelectedRow,
    isSelectedRow: _isSelectedRow,
  };
}

export function ActivityTable() {
  const viewActivities = useActivityInteractionViewStore(
    (state) => state.activityView,
  );

  const interactionType = useMapInteractionStore((state) => state.interaction);

  const { selectedRows, toggleSelectedRow, isSelectedRow } = useSelectedRow();

  const { movingTime, distance, totalElevationGain } = useMemo(() => {
    const defaultData: SummaryActivity = {
      movingTime: 0,
      distance: 0,
      totalElevationGain: 0,
    };

    if (!viewActivities) return defaultData;

    return viewActivities.reduce(
      (accumulator, activity) => {
        return {
          movingTime:
            (accumulator.movingTime || 0) + (activity.movingTime || 0),
          distance: (accumulator.distance || 0) + (activity.distance || 0),
          totalElevationGain:
            (accumulator.totalElevationGain || 0) +
            (activity.totalElevationGain || 0),
        };
      },
      {
        ...defaultData,
      },
    );
  }, [viewActivities]);

  const _headerColumns: MRT_ColumnDef<SummaryActivity>[] = [
    {
      header: "",
      accessorKey: "id",
      maxSize: 64,
      enableSorting: false,
      Cell: ({ row }) => {
        if (!row.original.id) return <></>;
        return (
          <>
            <Icon sx={{ height: "100%", alignItems: "center" }}>
              <Tooltip
                sx={{ textDecoration: "underline" }}
                title={"View on Strava"}
              >
                <a
                  href={`https://www.strava.com/activities/${row.original.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <OpenInNewIcon fontSize={"small"} />
                </a>
              </Tooltip>
            </Icon>{" "}
          </>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      Footer: () => (
        <div>
          {(viewActivities?.length || 0) > 0 ? (
            activityCount(viewActivities?.length || 0, interactionType)
          ) : (
            <></>
          )}
        </div>
      ),
    },
    {
      id: "startDate",
      accessorKey: "startDate",
      header: "Start Date",
      Cell: ({ row }) => (
        <div>
          {row.original.startDate !== undefined
            ? formatDate(row.original.startDate)
            : "N/A"}
        </div>
      ),
    },
    {
      id: "movingTime",
      accessorKey: "id",
      header: "Moving Time",
      Cell: ({ row }) => (
        <div>
          {row.original.movingTime !== undefined
            ? durationToTimeString(row.original.movingTime)
            : "N/A"}
        </div>
      ),
      Footer: () => (
        <div>
          Total:{" "}
          {movingTime !== undefined
            ? durationToTimeString(movingTime, {
                days: false,
                seconds: false,
                hoursIgnoreLowerUnitThreshold: 100,
              })
            : "N/A"}
        </div>
      ),
    },
    {
      id: "distance",
      header: "Distance",
      accessorKey: "distance",
      Cell: ({ row }) => (
        <div>
          {row.original.distance !== undefined
            ? formatDistance(row.original.distance)
            : "N/A"}
        </div>
      ),
      Footer: () => (
        <div>
          Total:{" "}
          {distance
            ? formatDistance(distance, { bigUnitExcludeDecimalThreshold: 100 })
            : "N/A"}
        </div>
      ),
    },
    {
      id: "totalElevationGain",
      header: "Elevation Gain",
      accessorKey: "totalElevationGain",
      Cell: ({ row }) => (
        <div>
          {row.original.totalElevationGain !== undefined
            ? `${formatDistance(row.original.totalElevationGain, { smallUnitExcludeDecimalThreshold: 100, bigUnitExcludeDecimalThreshold: 100, bigUnitUseThreshold: 100000 })}`
            : "N/A"}
        </div>
      ),
      Footer: () => (
        <div>
          Total:{" "}
          {totalElevationGain
            ? formatDistance(totalElevationGain, {
                bigUnitExcludeDecimalThreshold: 100,
              })
            : "N/A"}
        </div>
      ),
    },
  ];

  const table = useMaterialReactTable({
    columns: _headerColumns,
    data: viewActivities || [],
    initialState: {
      sorting: [
        {
          id: "startDate",
          desc: true,
        },
      ],
    },
    state: {
      rowSelection: selectedRows,
      isLoading: viewActivities === null,
    },
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableColumnActions: false,
    enableTopToolbar: false,
    enablePagination: false,
    enableRowVirtualization: true,
    enableStickyFooter: true,
    enableBottomToolbar: false,
    getRowId: (row) => `${row.id || 0}`,
    muiTablePaperProps: {
      sx: {
        backgroundColor: "transparent",
        height: "100%",
      },
    },
    muiTableHeadProps: {
      sx: (theme) => ({
        outlineColor: `${theme.palette.primary.dark}66`,
      }),
    },
    muiTableHeadRowProps: {
      sx: (theme) => ({
        backgroundColor: `${theme.palette.primary.dark}80`,
      }),
    },
    muiTableHeadCellProps: {
      sx: {
        border: "none",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "none",
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => toggleSelectedRow(row.id),
      selected: isSelectedRow(row.id),
      sx: (theme) => ({
        backgroundColor: isSelectedRow(row.id)
          ? `${theme.palette.primary.main}80`
          : `${theme.palette.primary.main}17`,
        "&:hover": {
          backgroundColor: `${theme.palette.primary.light}66`,
          fontSize: 16,
          cursor: "pointer",
        },
      }),
    }),
    muiTableFooterProps: {
      sx: (theme) => ({
        outlineColor: `${theme.palette.primary.dark}66`,
      }),
    },
    muiTableFooterRowProps: {
      sx: (theme) => ({
        backgroundColor: `${theme.palette.primary.dark}80`,
        border: "none",
      }),
    },
    muiTableFooterCellProps: {
      sx: {
        border: "none",
      },
    },
    renderEmptyRowsFallback: () => <NoRowsOverlay />,
  });

  return <MaterialReactTable table={table}></MaterialReactTable>;
}
