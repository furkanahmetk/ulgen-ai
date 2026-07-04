import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CsprClickProvider from "./providers/CsprClickProvider";

const inter = Inter({
  variable: "--font-inter",
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CsprClickProvider>
          {children}
        </CsprClickProvider>
      </body>
    </html>
  );
}
