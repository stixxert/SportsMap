import * as React from "react";
import { Drawer, Stack } from "@mui/material";

import FilterAltIcon from "@mui/icons-material/FilterAlt";

import {
  drawerVisible,
  selectedContains,
  SelectionMenuTypes,
  updateSelected,
} from "@/features/maps/components/overlay/Overlay";
import { JSX } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ActivityToolbarIcon } from "@/features/maps/components/activity/ToolbarIcon";
import {
  BaseIconButton,
  IconButtonBaseProps,
} from "@/features/maps/components/BaseIconButton";
import { ToolbarMarkerIcon } from "@/features/maps/components/overlay/ToolbarMarkerIcon";
import { UserAvatar } from "@/features/profile/components/user-avatar";

type FunctionIcon = {
  type: SelectionMenuTypes;
  label: string;
  icon: ((props: IconButtonBaseProps) => JSX.Element) | JSX.Element;
  activeIcon?: JSX.Element;
  overrideIcon?: boolean;
  overrideActiveIcon?: boolean;
};

const icons: FunctionIcon[] = [
  { type: "user", label: "User", icon: UserAvatar },
  {
    type: "list",
    label: "List activities",
    icon: ActivityToolbarIcon,
    activeIcon: <ChevronRightIcon />,
  },
  /* TODO: Implement filtering of activity categories */
  /*{
    type: "filter",
    label: "Filter activities",
    icon: <FilterAltIcon />,
  },*/
  {
    type: "marker",
    label: "Marker on map",
    icon: ToolbarMarkerIcon,
  },
];

export function FunctionToolbar({
  selected,
  setSelected,
}: {
  selected: SelectionMenuTypes[] | null;
  setSelected: (selected: SelectionMenuTypes[] | null) => void;
}) {
  return (
    <Drawer
      variant={"permanent"}
      anchor={"right"}
      sx={(theme) => ({
        width: 80,
        flexShrink: 0,
        display: "flex",
        overflow: "hidden",
        "& .MuiDrawer-paper": {
          overflow: "hidden",
          height: "400px",
          width: 80,
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
            right: drawerVisible(selected) ? "45vw" : 0,
          },
        },
      })}
    >
      <Stack
        direction={"column"}
        spacing={{ xs: 1 }}
        alignItems={"center"}
        paddingLeft={1}
      >
        {icons.map((icon) => {
          const isActive = selectedContains(selected, icon.type);

          function setActive(state?: boolean) {
            if (state === undefined) {
              const newSelection = isActive
                ? selected?.filter((select) => select !== icon.type) || []
                : updateSelected(selected, icon.type);

              setSelected(newSelection);

              return;
            }

            if (state) {
              if (isActive) return;

              const newSelection = updateSelected(selected, icon.type);

              setSelected(newSelection);
            } else {
              if (!isActive) return;

              const newSelection =
                selected?.filter((select) => select !== icon.type) || [];

              setSelected(newSelection);
            }
          }

          const props = {
            ...icon,
            icon: icon.icon as JSX.Element,
            isActive,
            setActive,
          };

          const Icon = icon.icon as (props: IconButtonBaseProps) => JSX.Element;

          if (typeof icon.icon === "function") {
            return <Icon {...props} key={icon.type} />;
          }

          return <BaseIconButton {...props} key={icon.type} />;
        })}
      </Stack>
    </Drawer>
  );
}
