import { readAccessToken } from "@/shared/auth/session";
import { env } from "@/shared/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const token = await readAccessToken();
  if (!token) return new Response("Unauthorized", { status: 401 });

  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const prefix = env.NEXT_PUBLIC_API_PREFIX.replace(/\/$/, "");
  const upstream = await fetch(`${base}${prefix}/boards/events`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
    cache: "no-store",
    signal: AbortSignal.timeout(55_000),
  }).catch(() => null);
  if (!upstream?.ok || !upstream.body) {
    return new Response("Realtime stream unavailable", { status: upstream?.status ?? 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
