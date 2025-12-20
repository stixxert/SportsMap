"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import { SummaryActivity } from "@/strava-api";
import { durationToTimeString, formatDistance } from "@/utils/unit";
import {
  useActivityStore,
  useMappableActivitiesStore,
} from "@/features/activity/stores/activity-store";
import { useEffect } from "react";
import {
  descendingComparator,
  Order,
} from "@/features/maps/components/utils/list";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Link from "next/link";

function getActivityComparator<Key extends keyof SummaryActivity>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string | Date },
  b: { [key in Key]: number | string | Date },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface HeadCell {
  disablePadding: boolean;
  id: keyof SummaryActivity;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Name",
  },
  {
    id: "startDate",
    numeric: false,
    disablePadding: false,
    label: "Start time",
  },
  {
    id: "movingTime",
    numeric: false,
    disablePadding: false,
    label: "Moving time",
  },
  {
    id: "distance",
    numeric: true,
    disablePadding: false,
    label: "Distance (km)",
  },
  {
    id: "totalElevationGain",
    numeric: true,
    disablePadding: false,
    label: "Elevation gain (m)",
  },
];

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof SummaryActivity,
  ) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, rowCount, onRequestSort } = props;
  const createSortHandler =
    (property: keyof SummaryActivity) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar({ numResults }: { numResults: number }) {
  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
      ]}
    >
      <Typography
        sx={{ flex: "1 1 100%", fontSize: "20px" }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Activities in view: {numResults}
      </Typography>
      <Tooltip title="Filter list">
        <IconButton>
          <FilterListIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

const ROWS_PER_PAGE = 10;

export default function EnhancedTable() {
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] =
    React.useState<keyof SummaryActivity>("startDate");
  const [selected, setSelected] = React.useState<SummaryActivity["id"]>(0);
  const [page, setPage] = React.useState(0);

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

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof SummaryActivity,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    setSelected(id);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * ROWS_PER_PAGE - loadedActivities.length)
      : 0;

  const visibleRows = React.useMemo(
    () =>
      [...loadedActivities]
        .sort(
          getActivityComparator(order, orderBy) as unknown as (
            a: SummaryActivity,
            b: SummaryActivity,
          ) => number,
        )
        .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [loadedActivities, order, orderBy, page],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar numResults={loadedActivities.length} />
        <TableContainer>
          <Table sx={{}} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={loadedActivities.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected === row.id;
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id!)}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <a
                        href={`https://www.strava.com/activities/${row.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <OpenInNewIcon />
                      </a>
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name || "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {dateTimeFormatter.format(
                        row.startDate
                          ? new Date(
                              row.startDate?.getTime() +
                                row.startDate?.getTimezoneOffset() * 60 * 1000,
                            )
                          : new Date(0),
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {durationToTimeString(row.movingTime || 0)}
                    </TableCell>
                    <TableCell align="right">
                      {formatDistance(row.distance || 0)}
                    </TableCell>
                    <TableCell align="right">
                      {row.totalElevationGain || 0}
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 50 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={loadedActivities.length}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          rowsPerPage={ROWS_PER_PAGE}
          page={page}
          onPageChange={handleChangePage}
        />
      </Paper>
    </Box>
  );
}
