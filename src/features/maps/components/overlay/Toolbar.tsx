import * as React from "react";
import { Drawer, Stack } from "@mui/material";

import RoomIcon from "@mui/icons-material/Room";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

import {
  drawerVisible,
  SelectionMenuTypes,
} from "@/features/maps/components/overlay/Overlay";
import { JSX } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ActivityToolbarIcon } from "@/features/maps/components/activity/ToolbarIcon";
import {
  IconButtonBase,
  IconButtonBaseProps,
  IconComponent,
} from "@/features/maps/components/IconButtonBase";

type FunctionIcon = {
  type: SelectionMenuTypes;
  label: string;
  icon: ((props: IconButtonBaseProps) => JSX.Element) | JSX.Element;
  activeIcon?: JSX.Element;
  overrideIcon?: boolean;
  overrideActiveIcon?: boolean;
};

const icons: FunctionIcon[] = [
  {
    type: "list",
    label: "List activities",
    icon: ActivityToolbarIcon,
    activeIcon: <ChevronRightIcon />,
    overrideIcon: true,
  },
  {
    type: "filter",
    label: "Filter activities",
    icon: <FilterAltIcon />,
  },
  {
    type: "marker",
    label: "Marker on map",
    icon: <RoomIcon />,
  },
];

export function FunctionToolbar({
  selected,
  setSelected,
}: {
  selected: SelectionMenuTypes | null;
  setSelected: (selected: SelectionMenuTypes | null) => void;
}) {
  return (
    <Drawer
      variant={"permanent"}
      anchor={"right"}
      sx={(theme) => ({
        width: 64,
        flexShrink: 0,
        display: "flex",
        "& .MuiDrawer-paper": {
          width: 64,
          top: 0,
          border: "none",
          backgroundColor: "transparent",
          paddingTop: 2,
        },

        [theme.breakpoints.down("sm")]: {
          "& .MuiDrawer-paper": {
            right: drawerVisible(selected) ? "80vw" : 0,
          },
        },
        [theme.breakpoints.up("sm")]: {
          "& .MuiDrawer-paper": {
            right: drawerVisible(selected) ? "35vw" : 0,
          },
        },
      })}
    >
      <Stack direction={"column"} spacing={{ xs: 1 }} alignItems={"center"}>
        {icons.map((icon) => {
          const isActive = icon.type === selected;

          const setActive = () =>
            setSelected(selected === icon.type ? null : icon.type);

          const props = {
            ...icon,
            icon: icon.icon as JSX.Element,
            isActive,
            setActive,
          };

          const Icon = icon.icon as (props: IconButtonBaseProps) => JSX.Element;

          if (icon.overrideIcon) {
            return <Icon {...props} key={icon.type} />;
          }

          return <IconButtonBase {...props} key={icon.type} />;
        })}
      </Stack>
    </Drawer>
  );
}
