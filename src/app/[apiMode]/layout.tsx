import React from "react";
import ApiProvider from "@app/[apiMode]/provider";

export default function ApiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ApiProvider>{children}</ApiProvider>;
}
