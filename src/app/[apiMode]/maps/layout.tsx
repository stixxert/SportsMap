"use client";

import React from "react";
import MapsProvider from "@app/[apiMode]/maps/provider";

export default function MapsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MapsProvider>{children}</MapsProvider>;
}
