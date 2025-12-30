"use client";

import React from "react";
import dynamic from "next/dynamic";
const ApiProvider = dynamic(
  () => import("@/app/maps/[[...apiType]]/provider"),
  {
    ssr: false,
  },
);

export default function ApiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ApiProvider>{children}</ApiProvider>;
}
