import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/shared/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Telegram bot konstruktori`,
    short_name: SITE_NAME,
    description:
      "Kod yozmasdan Telegram bot yarating: vizual konstruktor, AI agent, CRM va to'lovlar.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/logo-icon-light.png", sizes: "any", type: "image/png" },
      { src: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
