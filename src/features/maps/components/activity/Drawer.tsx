import * as React from "react";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { ActivityTable } from "@/features/maps/components/activity/Table";

export function ActivityDrawer({ drawerOpen }: { drawerOpen: boolean }) {
  return (
    <Box
      sx={{
        pointerEvents: "auto",
        right: 0,
        alignItems: "right",
        height: "100%",
        visibility: drawerOpen ? "visible" : "hidden",
      }}
    >
      <Drawer
        variant="persistent"
        anchor="right"
        open={drawerOpen}
        sx={[
          {},
          (theme) => ({
            [theme.breakpoints.down("sm")]: {
              width: "80vh",
              "& .MuiDrawer-paper": {
                backgroundColor: "transparent",
                width: "80vw",
              },
            },
            [theme.breakpoints.up("sm")]: {
              width: "45vw",
              "& .MuiDrawer-paper": {
                border: "none",
                backgroundColor: "transparent",
                width: "45vw",
              },
            },
          }),
        ]}
      >
        <Box sx={{ flex: 1 }}>
          <ActivityTable />
        </Box>
      </Drawer>
    </Box>
  );
}
