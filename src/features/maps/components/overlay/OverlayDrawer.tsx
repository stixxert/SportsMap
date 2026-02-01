import * as React from "react";

import Drawer from "@mui/material/Drawer";
import { ActivityTable } from "@/features/maps/components/activity/ActivityTable";
import {
  drawerVisible,
  selectedContains,
  SelectionMenuTypes,
  useDrawerOpenWidth,
} from "@/features/maps/components/overlay/Overlay";
import { FilterOptionBox } from "@/features/maps/components/activity/FilterOptionBox";

export function OverlayDrawer({
  selected,
}: {
  selected: SelectionMenuTypes[] | null;
}) {
  const drawerWidth = useDrawerOpenWidth(selected);

  return (
    <Drawer
      anchor={"right"}
      variant={"persistent"}
      sx={{ height: "100vh" }}
      slotProps={{
        paper: {
          sx: {
            width: drawerWidth,
            pointerEvents: "auto",
            backgroundColor: "transparent",
            border: "none",
          },
        },
      }}
      open={drawerVisible(selected)}
    >
      {selectedContains(selected, "list") ? <ActivityTable /> : <></>}
      {selectedContains(selected, "filter") ? <FilterOptionBox /> : <></>}
    </Drawer>
  );
}
