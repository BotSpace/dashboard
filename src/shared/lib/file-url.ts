import { env } from "@/shared/lib/env";
import { applyApiPrefix } from "@/shared/api/client";

// The backend returns a file's download URL as a RELATIVE path
// ("/api/v1/file/<uuid>/download"). Rendered as-is it resolves against the
// frontend origin (botspace.uz) — which doesn't serve files, so it 404s. Build
// the absolute API URL (api.botspace.uz, with the same /api/v1→prefix rewrite
// the rest of the app uses). The download route is public and redirects to the
// B2 object, so a plain link works without a token.
export function fileDownloadUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url; // already absolute (e.g. a direct B2 url)
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const path = url.startsWith("/") ? applyApiPrefix(url) : "/" + url;
  return base + path;
}
