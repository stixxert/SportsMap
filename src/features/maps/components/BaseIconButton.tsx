import { Avatar, ButtonBase, Tooltip } from "@mui/material";
import * as React from "react";
import { JSX } from "react";

export type IconComponent = (props: IconButtonBaseProps) => JSX.Element;

export interface IconButtonBaseProps {
  label: string;
  icon: JSX.Element;
  isActive?: boolean;
  setActive?: (state?: boolean) => void;
  secondaryColor?: boolean;
  activeIcon?: JSX.Element;
  disabled?: boolean;
}

export function BaseIconButton(props: IconButtonBaseProps): JSX.Element {
  const {
    label,
    icon,
    isActive,
    setActive,
    activeIcon,
    secondaryColor,
    disabled,
  } = props;
  return (
    <Tooltip
      sx={{ width: "100%", height: "100%" }}
      title={label}
      disableInteractive
    >
      <Avatar
        sx={(theme) => ({
          borderRadius: "50%",
          backgroundColor: isActive
            ? theme.palette.primary.dark
            : secondaryColor
              ? theme.palette.info.main
              : theme.palette.primary.light,
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
          },
        })}
      >
        <ButtonBase
          disabled={disabled}
          sx={{ width: "100%", height: "100%" }}
          onClick={setActive ? () => setActive() : () => {}}
        >
          {isActive && activeIcon ? activeIcon : icon}
        </ButtonBase>
      </Avatar>
    </Tooltip>
  );
}
