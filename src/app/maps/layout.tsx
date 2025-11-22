"use client";

import React from "react";
import MapsModeProvider from "@app/maps/provider";

export default function MapsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MapsModeProvider>{children}</MapsModeProvider>;
}
