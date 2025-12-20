"use client";

import React from "react";
import MapsProvider from "@/app/maps/provider";

export default function MapsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MapsProvider>{children}</MapsProvider>;
}
