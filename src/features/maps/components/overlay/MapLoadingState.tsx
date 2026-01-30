import {
  CircularProgress,
  Backdrop,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { useMapLoadState } from "@/features/maps/hooks/map-load-state";

export default function MapLoadingState() {
  const loadState = useMapLoadState();
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
          <CircularProgress color={"inherit"} sx={{ marginBottom: 1 }} />
          <Typography>Loading</Typography>
          <Divider />
          <Typography>{loadState.status ?? "Done!"}</Typography>
        </Stack>
      </Backdrop>
    </div>
  );
}
