import {OptionsType} from "cookies-next";

export const COOKIE_EXPIRY = 60 * 60 * 24;

export type Cookie = {
    key: string;
    options: OptionsType
}

const COMMON_OPTIONS: OptionsType = {
    maxAge: COOKIE_EXPIRY,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
}

const CLIENT_ACCESSIBLE_OPTIONS: OptionsType = {
    ...COMMON_OPTIONS,
    httpOnly: false,
}

const SERVER_ONLY_ACCESSIBLE_OPTIONS: OptionsType = {
    ...COMMON_OPTIONS,
    httpOnly: true,
}

export const ATHLETE_INFO_COOKIE: Cookie = {
    key: "athlete_info",
    options: CLIENT_ACCESSIBLE_OPTIONS
}

export const ACCESS_TOKEN_COOKIE: Cookie = {
    key: "access_token",
    options: CLIENT_ACCESSIBLE_OPTIONS
}

/* only server should refresh access token, as this requires api key */
export const REFRESH_TOKEN_COOKIE: Cookie = {
    key: "refresh_token",
    options: SERVER_ONLY_ACCESSIBLE_OPTIONS
}