import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  usePrivacyNoticeState,
  usePrivacyNoticeStore,
} from "@/features/profile/stores/privacy-notice";

const TextStyle = styled(DialogContentText)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    fontSize: 12,
  },
  [theme.breakpoints.up("md")]: {
    fontSize: 15,
  },
}));

export function PrivacyDialog() {
  const open = usePrivacyNoticeState();

  const setOpen = usePrivacyNoticeStore((state) => state.setOpen);

  function close() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>Privacy Notice</DialogTitle>
      <DialogContent>
        <TextStyle>
          The server is only involved in updating your authentication tokens,
          which it returns back to your browser.
        </TextStyle>
        <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
        <TextStyle>
          These authentication tokens are then used by your browser to retrieve
          activities and other information from your Strava account.
        </TextStyle>
        <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
        <TextStyle>
          If any traces of your authentication handshakes are left on the
          server, it is because the server hoster/provider stores logs regarding
          traffic.
        </TextStyle>
        <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
        <TextStyle>
          {`Logging out using your profile icon will automatically revoke all
          accesses you've given to this app.`}
        </TextStyle>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
