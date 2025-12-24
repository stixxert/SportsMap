"use client";

import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { NewTable } from "@/features/maps/components/activity-list/list-component";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export function ViewDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          pointerEvents: "auto",
          right: 0,
          alignItems: "right",
        }}
      >
        <CssBaseline />
        <Toolbar sx={{ position: "absolute", right: 0 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            sx={[open && { display: "none" }]}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <DrawerHeader />
      </Box>
      <Box sx={{ display: "flex", pointerEvents: "auto" }}>
        <Drawer
          sx={(theme) => ({
            [theme.breakpoints.down("sm")]: {
              width: "80vw",
              "& .MuiDrawer-paper": {
                width: "80vw",
              },
            },
            [theme.breakpoints.up("sm")]: {
              width: "25vw",
              "& .MuiDrawer-paper": {
                width: "25vw",
              },
            },

            flexShrink: 0,
          })}
          variant="persistent"
          anchor="right"
          open={open}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", flexDirection: "row" }}
          >
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
                <ChevronRightIcon />
              </IconButton>
            </DrawerHeader>
            <Divider />
          </Box>
          <Box sx={{ flex: 1 }}>
            <NewTable />
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
