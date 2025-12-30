import React, { useState } from "react";

import { Box } from "@mui/material";
import { FunctionToolbar } from "@/features/maps/components/overlay/Toolbar";
import { ActivityDrawer } from "@/features/maps/components/activity/Drawer";
import L from "leaflet";
import { ViewController } from "@/features/maps/components/View";

export type SelectionMenuTypes = "list" | "filter" | "marker";

export function drawerVisible(selected: SelectionMenuTypes | null) {
  return selected !== null && selected !== "marker";
}

export default function Overlay({
  map,
}: {
  map: React.RefObject<L.Map | null>;
}) {
  const [selected, setSelected] = useState<SelectionMenuTypes | null>(null);

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
        <ActivityDrawer drawerOpen={selected === "list"} />
        <FunctionToolbar selected={selected} setSelected={setSelected} />
      </Box>
    </>
  );
}
