import {
  Avatar,
  Tooltip,
  ButtonBase,
  MenuItem,
  Menu,
  ListItemIcon,
} from "@mui/material";
import { useProfile } from "@/features/profile/use-profile";
import React, { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";
import { Logout } from "@/src/lib/user-actions";

export function UserAvatar() {
  const { user } = useProfile();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [clickOpen, setClickOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);

  const isOpen = anchorEl !== null;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (hoverOpen) setHoverOpen(false);

    setAnchorEl(event.currentTarget);
    setClickOpen(true);
  }

  function handleHover(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!clickOpen) {
      setHoverOpen(true);
      setAnchorEl(event.currentTarget);
    }
  }

  function handleClose() {
    if (clickOpen) {
      setClickOpen(false);
      setAnchorEl(null);
    }
  }

  function handleHoverClose() {
    if (hoverOpen) {
      setHoverOpen(false);
      setAnchorEl(null);
    }
  }

  return (
    <>
      <ButtonBase
        sx={{
          borderRadius: "50%",
          width: "100%",
          height: "100%",
          "&:hover": {},
        }}
        onClick={handleClick}
        onMouseOver={handleHover}
      >
        <Tooltip sx={{ width: "100%", height: "100%" }} title={"User options"}>
          <Avatar
            sx={(theme) => ({
              borderRadius: "50%",
              backgroundColor: theme.palette.primary.light,
            })}
            src={user?.profile || user?.profileMedium}
          ></Avatar>
        </Tooltip>
      </ButtonBase>
      <Menu
        id={"user-menu"}
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: (theme) => ({
              mt: 1,
              backgroundColor: theme.palette.primary.light,
            }),
          },
          list: { onMouseLeave: handleHoverClose },
        }}
      >
        {user ? (
          <MenuItem onClick={Logout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        ) : (
          <Link href={"/authorize"}>
            <MenuItem>
              <ListItemIcon>
                <LoginIcon fontSize="small" />
              </ListItemIcon>
              Login
            </MenuItem>
          </Link>
        )}
      </Menu>
    </>
  );
}
