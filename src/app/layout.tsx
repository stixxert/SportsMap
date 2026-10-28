import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Head from "next/head";
import AppProvider from "@/app/provider";

/*
 * No webfont is loaded here on purpose. The previous Geist/Geist_Mono setup defined
 * `--font-geist-*` CSS variables that nothing referenced, so the app always rendered in
 * the fallback font while still paying for the download. Load a font here only together
 * with a component that actually applies its class.
 */

export const metadata: Metadata = {
  title: "Sports Map",
  description: "Sports Map interacts with Strava Activities",
  icons: { icon: undefined },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
