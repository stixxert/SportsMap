import {
  Button,
  CircularProgress,
  Backdrop,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { useMapLoadState } from "@/features/maps/hooks/map-load-state";
import { useActivitySyncStore } from "@/lib/activity/sync-state";

export default function MapLoadingState() {
  const loadState = useMapLoadState();

  // Retry re-arms the sync hook by clearing both the settled flag and the error.
  function retry() {
    const store = useActivitySyncStore.getState();

    store.setSyncError(null);
    store.setActivitiesSync(null);
  }

  return (
    <div>
      <Backdrop
        open={!loadState.ready}
        sx={(theme) => ({
          pointerEvents: "none",
          zIndex: theme.zIndex.drawer,
        })}
      >
        <Stack
          direction={"column"}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {loadState.failed ? (
            <>
              <Typography>Could not load activities</Typography>
              <Divider />
              <Typography variant={"body2"} sx={{ marginBottom: 1 }}>
                {loadState.status}
              </Typography>
              <Button
                variant={"contained"}
                size={"small"}
                onClick={retry}
                sx={{ pointerEvents: "auto" }}
              >
                Retry
              </Button>
            </>
          ) : (
            <>
              <CircularProgress color={"inherit"} sx={{ marginBottom: 1 }} />
              <Typography>Loading</Typography>
              <Divider />
              <Typography>{loadState.status ?? "Done!"}</Typography>
            </>
          )}
        </Stack>
      </Backdrop>
    </div>
  );
}
