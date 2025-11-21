"use client";

import { APIConfigurationProvider } from "@/src/providers/APIConfigurationProvider";
import { useParams } from "next/navigation";
import React from "react";

export default function MapsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  return (
    <APIConfigurationProvider slug={params.mapMode}>
      {children}
    </APIConfigurationProvider>
  );
}
