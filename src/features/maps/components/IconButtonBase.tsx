import { Avatar, ButtonBase, Tooltip } from "@mui/material";
import * as React from "react";
import { JSX } from "react";

export type IconComponent = (props: IconButtonBaseProps) => JSX.Element;

export interface IconButtonBaseProps {
  label: string;
  icon: JSX.Element;
  isActive: boolean;
  setActive: () => void;
  activeIcon?: JSX.Element;
}

export interface IconButtonActivatedOverrideProps extends IconButtonBaseProps {}

export function IconButtonBase(props: IconButtonBaseProps): JSX.Element {
  const { label, icon, isActive, setActive, activeIcon } = props;
  return (
    <Avatar
      sx={(theme) => ({
        borderRadius: "50%",
        backgroundColor: isActive
          ? theme.palette.primary.dark
          : theme.palette.primary.light,
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
        },
      })}
    >
      <Tooltip sx={{ width: "100%", height: "100%" }} title={label}>
        <ButtonBase
          sx={{ width: "100%", height: "100%" }}
          onClick={() => setActive()}
        >
          {isActive && activeIcon ? activeIcon : icon}
        </ButtonBase>
      </Tooltip>
    </Avatar>
  );
}
