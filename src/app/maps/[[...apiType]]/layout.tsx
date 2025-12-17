import React from "react";
import ApiProvider from "@app/maps/[[...apiType]]/provider";

export default function ApiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ApiProvider>{children}</ApiProvider>;
}
