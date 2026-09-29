import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = { title: { default: "NEXA — Find the thread in your team's knowledge", template: "%s — NEXA" }, description: "NEXA is a concept AI knowledge workspace. Explore documents, trace sample answers to sources, and simulate workflows in a local demo.", robots: { index: false, follow: false } };
const manrope = localFont({
  src: [
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-500-normal.woff2", weight: "500" },
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-600-normal.woff2", weight: "600" },
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-700-normal.woff2", weight: "700" },
    { path: "../node_modules/@fontsource/manrope/files/manrope-latin-800-normal.woff2", weight: "800" },
  ], display: "swap", preload: true,
});
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body className={manrope.className}>{children}</body></html>; }
