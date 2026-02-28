import * as React from "react";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  Box,
  Checkbox,
  TextField,
  Autocomplete,
  Button,
  Switch,
  Typography,
  Stack,
} from "@mui/material";
import { SportType } from "@/src/generated/strava-api";

import {
  useApplyFilter,
  useFilterModifyStore,
} from "@/features/maps/stores/current-filter-state";
import { useState } from "react";
import {
  getDefaultFilter,
  setDefaultFilter,
  useActivityFilter,
  useActivityFilterStore,
  useFilterProcessingResultsStatus,
} from "@/lib/filter/active-filter-store";
import { defaultFilter } from "@/config/default-filter";

interface SportTypeFilter {
  displayName: string;
  sportType: SportType;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function SportTypeFilter() {
  const currentFilter = useFilterModifyStore((state) => state.filter);
  const setCurrentFilter = useFilterModifyStore((state) => state.setFilter);

  const selected = (currentFilter.sportType as SportType[])
    .map((select) => allLabels.find((v) => v.sportType === select))
    .filter((v) => v !== undefined);

  const handleChange = (
    event: React.SyntheticEvent,
    newValues: SportTypeFilter[],
  ) => {
    setCurrentFilter({
      ...currentFilter,
      sportType: newValues.map((v) => v.sportType),
    });
  };

  return (
    <Autocomplete
      limitTags={3}
      multiple
      id={"sport-type-filter"}
      options={allLabels}
      disableCloseOnSelect
      getOptionLabel={(option) => option.displayName}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;

        return (
          <li key={key} {...optionProps}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.displayName}
          </li>
        );
      }}
      sx={{
        width: "20vw",
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={"Sport Types"}
          placeholder={"Pick sport types"}
        />
      )}
      value={selected}
      onChange={handleChange}
      slotProps={{
        listbox: {
          sx: (theme) => ({
            backgroundColor: `${theme.palette.primary.light}CF`,
          }),
        },
        paper: { sx: { background: "transparent" } },
      }}
    />
  );
}

function DatePickerFilter({ selector }: { selector: "startDate" | "endDate" }) {
  const currentFilter = useFilterModifyStore((state) => state.filter);
  const setCurrentFilter = useFilterModifyStore((state) => state.setFilter);

  const currentSelector = useFilterModifyStore(
    (state) => state.filter[selector],
  );

  const fieldIsDefault =
    currentSelector.getTime() === defaultFilter[selector].getTime();

  const [switchOpen, setSwitchOpen] = useState(!fieldIsDefault);

  const switchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwitchOpen(event.target.checked);

    if (!event.target.checked) {
      setCurrentFilter({
        ...currentFilter,
        [selector]: new Date(getDefaultFilter()[selector]),
      });
    }
  };

  const fieldValue = fieldIsDefault ? null : dayjs(currentSelector);

  const updateValue = (newValue: Dayjs | null) => {
    let _value = newValue
      ? new Date(
          newValue
            .set("h", 0)
            .set("m", 0)
            .set("s", 0)
            .set("milliseconds", 0)
            .toDate()
            .getTime(),
        )
      : getDefaultFilter()[selector];
    if (selector === "endDate" && newValue) {
      _value = new Date(
        newValue
          .set("h", 23)
          .set("m", 59)
          .set("s", 59)
          .set("milliseconds", 59)
          .toDate()
          .getTime(),
      );
    }
    setCurrentFilter({
      ...currentFilter,
      [selector]: _value,
    });
  };

  const dateLabel = `Set ${selector === "startDate" ? "start date" : "end date"}`;

  const additionalProps =
    selector === "startDate"
      ? {
          maxDate:
            currentFilter.endDate === defaultFilter[selector]
              ? undefined
              : dayjs(currentFilter.endDate),
        }
      : {
          minDate:
            currentFilter.startDate === defaultFilter[selector]
              ? undefined
              : dayjs(currentFilter.startDate),
        };

  return (
    <Box>
      <Stack alignItems={"center"} direction={"row"}>
        <Switch checked={switchOpen} onChange={switchChange} />
        <Typography>{dateLabel}</Typography>
      </Stack>
      {switchOpen && (
        <DatePicker
          label={dateLabel}
          value={fieldValue}
          onChange={updateValue}
          {...additionalProps}
        />
      )}
    </Box>
  );
}

export function FilterOptionBox() {
  const applyFilter = useApplyFilter();

  const filterProcessingReady = useFilterProcessingResultsStatus();

  return (
    <Box
      sx={(theme) => ({
        paddingTop: "1cm",
        paddingLeft: 1,
        paddingRight: 1,
        backgroundColor: `${theme.palette.primary.main}30`,
        width: "100%",
        borderRadius: "16px",
      })}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Stack direction="column" spacing={2}>
          <SportTypeFilter />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePickerFilter selector={"startDate"} />
            <DatePickerFilter selector={"endDate"} />
          </LocalizationProvider>
        </Stack>
      </Box>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{
          marginTop: 3,
          marginBottom: 1,
          position: "relative",
          left: 0,
          bottom: 0,
        }}
      >
        <Button
          disabled={!filterProcessingReady}
          onClick={applyFilter}
          sx={(theme) => ({
            color: "black",
            backgroundColor: `${theme.palette.primary.main}80`,

            "&:hover": {
              backgroundColor: `${theme.palette.primary.light}66`,
            },
          })}
        >
          Apply
        </Button>
        <Button
          onClick={() => {
            setDefaultFilter()(useActivityFilterStore.getState().filter);
          }}
          sx={(theme) => ({
            color: "black",
            backgroundColor: `${theme.palette.primary.main}80`,

            "&:hover": {
              backgroundColor: `${theme.palette.primary.light}66`,
            },
          })}
        >
          Set preferences
        </Button>
        <Button
          onClick={() => {
            useFilterModifyStore.getState().setFilter(defaultFilter);
            applyFilter();
          }}
          sx={(theme) => ({
            color: "black",
            backgroundColor: `${theme.palette.primary.main}80`,

            "&:hover": {
              backgroundColor: `${theme.palette.primary.light}66`,
            },
          })}
        >
          Reset
        </Button>
      </Stack>
    </Box>
  );
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
