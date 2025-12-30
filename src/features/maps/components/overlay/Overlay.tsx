import React, { useState } from "react";

import { Box } from "@mui/material";
import { FunctionToolbar } from "@/features/maps/components/overlay/Toolbar";
import { ActivityDrawer } from "@/features/maps/components/activity/Drawer";
import L from "leaflet";
import { ViewController } from "@/features/maps/components/View";

export const MENU_OPTIONS_FOR_DRAWER = ["list", "filter"] as const;

export type SelectionMenuTypes =
  | (typeof MENU_OPTIONS_FOR_DRAWER)[number]
  | "marker";

export function selectedContains(
  selected: SelectionMenuTypes[] | null,
  contains: SelectionMenuTypes,
) {
  return selected ? selected.find((s) => s === contains) !== undefined : false;
}

export function updateSelected(
  selected: SelectionMenuTypes[] | null,
  newSelected: SelectionMenuTypes,
) {
  let updatedSelected = selected ? selected.slice() : [];

  if (drawerVisible(selected) && newSelected in MENU_OPTIONS_FOR_DRAWER) {
    for (const drawerOption of MENU_OPTIONS_FOR_DRAWER) {
      if (selectedContains(selected, drawerOption)) {
        updatedSelected = updatedSelected.filter(
          (option) => option !== drawerOption,
        );
      }
    }
  }

  return [...updatedSelected, newSelected];
}

export function drawerVisible(selected: SelectionMenuTypes[] | null) {
  if (selected === null) return false;

  for (const drawerOption of MENU_OPTIONS_FOR_DRAWER) {
    if (selectedContains(selected, drawerOption)) return true;
  }

  return false;
}

export default function Overlay({
  map,
}: {
  map: React.RefObject<L.Map | null>;
}) {
  const [selected, setSelected] = useState<SelectionMenuTypes[] | null>(null);

  return (
    <>
      <Box sx={{ left: 0 }}>
        <ViewController map={map} />
      </Box>
      <Box
        sx={{
          right: 0,
        }}
      >
        <ActivityDrawer drawerOpen={selectedContains(selected, "list")} />
        <FunctionToolbar selected={selected} setSelected={setSelected} />
      </Box>
    </>
  );
}
