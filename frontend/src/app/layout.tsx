import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CsprClickProvider from "./providers/CsprClickProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentinel AI — Autonomous Due Diligence Agent",
  description: "AI-powered autonomous due diligence for DeFi and RWA projects on the Casper Network. Powered by CSPR.cloud MCP, x402 Facilitator, and Odra Framework.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CsprClickProvider>
          {children}
        </CsprClickProvider>
      </body>
    </html>
  );
}
