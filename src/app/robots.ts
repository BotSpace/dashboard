import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private / non-content areas (and their locale-prefixed variants).
        disallow: [
          "/app/",
          "/*/app/",
          "/api/",
          "/constructor",
          "/*/constructor",
          "/mcp-auth",
          "/*/mcp-auth",
          "/oauth/",
          "/*/oauth/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
