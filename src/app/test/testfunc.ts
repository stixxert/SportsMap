"use server"

import {setCookie} from "cookies-next/server";
import {cookies} from "next/headers";

export async function setTestCookie() {
    const cookieStore = await cookies();

    cookieStore.set("test-test2", "test-test2");

    setCookie("test-test", 'test-test', { cookies });
}