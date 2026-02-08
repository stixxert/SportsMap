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
import { useApplyFilter } from "@/features/maps/stores/current-filter-state";
import { useEffect, useRef } from "react";

export function OverlayDrawer({
  selected,
}: {
  selected: SelectionMenuTypes[] | null;
}) {
  const drawerWidth = useDrawerOpenWidth(selected);

  const applyFilter = useApplyFilter();

  const filterWasActive = useRef(false);

  useEffect(() => {
    if (selectedContains(selected, "filter")) filterWasActive.current = true;

    if (!selectedContains(selected, "filter") && filterWasActive.current) {
      applyFilter();

      filterWasActive.current = false;
    }
  }, [applyFilter, selected]);

  return (
    <Drawer
      anchor={"right"}
      variant={"persistent"}
      sx={{ height: "auto" }}
      slotProps={{
        paper: {
          sx: {
            height: "auto",
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
