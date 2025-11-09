"use client"

import {useEffect} from "react";
import {setTestCookie} from "@/src/app/test/testfunc";

export default function TestComponent() {
    useEffect(() => {
        setTestCookie().then()
    }, []);

    return (
        <></>
    )
}