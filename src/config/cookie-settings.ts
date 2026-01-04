import { OptionsType } from "cookies-next";

export const COOKIE_EXPIRY_MONTH = 60 * 60 * 24 * 31;
export const COOKIE_EXPIRY_HOUR = 60 * 60;

export type Cookie = {
  key: string;
  options: OptionsType;
};

const COMMON_OPTIONS: OptionsType = {
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
};

const CLIENT_ACCESSIBLE_OPTIONS: OptionsType = {
  ...COMMON_OPTIONS,
  httpOnly: false,
};

const SERVER_ONLY_ACCESSIBLE_OPTIONS: OptionsType = {
  ...COMMON_OPTIONS,
  httpOnly: true,
};

export const ACCESS_TOKEN_COOKIE: Cookie = {
  key: "accessToken",
  options: { ...CLIENT_ACCESSIBLE_OPTIONS, maxAge: COOKIE_EXPIRY_HOUR },
};

/* only server should refresh access token, as this requires external-api key */
export const REFRESH_TOKEN_COOKIE: Cookie = {
  key: "refreshToken",
  options: { ...SERVER_ONLY_ACCESSIBLE_OPTIONS, maxAge: COOKIE_EXPIRY_MONTH },
};
