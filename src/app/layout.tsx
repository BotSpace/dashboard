import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Botmother — Telegram botlarni vizual yarating",
    template: "%s · Botmother",
  },
  description:
    "Botmother — Telegram botlarni vizual konstruktor, AI agent va marketplace bilan yaratish platformasi.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
