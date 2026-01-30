import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ModalProps,
  Divider,
  Button,
} from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import { usePrivacyNoticeStore } from "@/features/profile/stores/privacy-notice";
import Link from "next/link";

const TextStyle = styled(DialogContentText)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    fontSize: 12,
  },
  [theme.breakpoints.up("md")]: {
    fontSize: 15,
  },
}));

export function LoginDialog({ open }: { open: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(open);

  const setPrivacyDialogOpen = usePrivacyNoticeStore((state) => state.setOpen);

  const _handleClose: ModalProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick") return;

    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onClose={_handleClose}>
      <DialogTitle>Sports Map</DialogTitle>
      <DialogContent>
        {" "}
        <TextStyle>
          Uses your logged activities to create a map that shows what you did,
          and where.
        </TextStyle>{" "}
        <Divider sx={{ marginBottom: 1, marginTop: 1 }} />
        <TextStyle>
          The list of activities changes to match your world view, and to points
          you select on the map.
        </TextStyle>
        <Divider sx={{ marginBottom: 1, marginTop: 1 }} />
        <TextStyle sx={{ marginTop: 1, textAlign: "center" }}>
          Connect with Strava to get started!
        </TextStyle>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPrivacyDialogOpen(true)}>
          Privacy Notice
        </Button>
        <Button>
          <a href={"/demo"}>Try demo</a>
        </Button>
        <Button>
          <a href={"/login"}>Login with Strava</a>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
