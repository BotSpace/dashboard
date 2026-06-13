import type { Metadata, Viewport } from "next";
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from "@/shared/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BotSpace — Telegram bot yaratish AI konstruktori",
    template: "%s · BotSpace",
  },
  description:
    "Kod yozmasdan Telegram bot yarating: vizual flow konstruktor, AI agent, CRM, to'lov va marketplace. BotSpace'da bepul boshlang.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo-icon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/logo-icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/logo-icon-light.png",
  },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "uz_UZ",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
