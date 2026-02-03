import { Typography, Stack, Avatar, Drawer } from "@mui/material";
import React from "react";
import { usePrivacyNoticeStore } from "@/components/privacy-notice/privacy-notice";
import GitHubIcon from "@mui/icons-material/GitHub";

export function BottomMenu() {
  const setPrivacyDialogOpen = usePrivacyNoticeStore((state) => state.setOpen);

  return (
    <Drawer
      variant={"permanent"}
      anchor={"bottom"}
      sx={{
        flexShrink: 0,
        display: "flex",
        "& .MuiDrawer-paper": {
          width: "100px",
          border: "none",
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack direction={"row"}>
        {process.env.NEXT_PUBLIC_GITHUB_URL && (
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL}
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <Avatar sx={{ backgroundColor: "transparent" }}>
              <GitHubIcon />
            </Avatar>
          </a>
        )}
        <Typography
          sx={{
            cursor: "pointer",
            paddingLeft: 1,
            paddingTop: 2,
          }}
          onClick={() => setPrivacyDialogOpen(true)}
          fontSize={13}
        >
          Privacy
        </Typography>
      </Stack>
    </Drawer>
  );
}
