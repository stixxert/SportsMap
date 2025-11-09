"use server";

import {SummaryAthlete} from "@/strava-api";
import {AccessToken} from "@utils/types";
import {CookieValueTypes, getCookie, setCookie} from "cookies-next/server";
import {ACCESS_TOKEN_COOKIE, ATHLETE_INFO_COOKIE, REFRESH_TOKEN_COOKIE} from "@lib/cookies/options";
import {cookies} from "next/headers";

export async function setAthleteInfoCookie(athleteInfo: SummaryAthlete): Promise<void> {
    return setCookie(ATHLETE_INFO_COOKIE.key, JSON.stringify(athleteInfo), {...ATHLETE_INFO_COOKIE.options, cookies });
}

export async function setRefreshTokenCookie(refreshToken: string): Promise<void> {
    return setCookie(REFRESH_TOKEN_COOKIE.key, JSON.stringify(refreshToken), {...REFRESH_TOKEN_COOKIE.options, cookies });
}

export async function setAccessTokenCookie(accessToken: AccessToken): Promise<void> {
    return setCookie(ACCESS_TOKEN_COOKIE.key, JSON.stringify(accessToken), {...ACCESS_TOKEN_COOKIE.options, cookies });
}

export async function getRefreshTokenCookie(): Promise<CookieValueTypes> {
    const cookie = await getCookie(REFRESH_TOKEN_COOKIE.key, {...REFRESH_TOKEN_COOKIE.options, cookies });

    if (!cookie) {
        return cookie
    }

    return JSON.parse(cookie);
}