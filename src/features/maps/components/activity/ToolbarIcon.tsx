import ListIcon from "@mui/icons-material/List";

import { Badge } from "@mui/material";

import { useActivityInteractionViewStore } from "@/features/maps/stores/activity-interaction-view-store";
import {
  BaseIconButton,
  IconButtonBaseProps,
} from "@/features/maps/components/BaseIconButton";
import { JSX } from "react";

export function ActivityToolbarIcon(props: IconButtonBaseProps): JSX.Element {
  const viewActivities = useActivityInteractionViewStore(
    (state) => state.activityView,
  );
  return (
    <Badge
      color="secondary"
      badgeContent={(!props.isActive && viewActivities?.length) || 0}
      max={999}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <BaseIconButton {...props} icon={<ListIcon />} />
    </Badge>
  );
}
