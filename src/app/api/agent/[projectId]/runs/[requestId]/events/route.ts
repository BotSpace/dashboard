import { NextRequest } from "next/server";
import { AGENT_BASE, agentFetch } from "@/shared/api/agent";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ projectId: string; requestId: string }> }
) {
  const { projectId, requestId } = await ctx.params;
  const url = new URL(req.url);
  const since = url.searchParams.get("since_seq");
  const path =
    `/projects/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}/events` +
    (since ? `?since_seq=${since}` : "");
  try {
    const upstream = await agentFetch(path, {
      headers: { Accept: "text/event-stream" },
    });
    if (!upstream.ok || !upstream.body) {
      return new Response(`Upstream error ${upstream.status}`, { status: upstream.status });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    return new Response(`Agent unreachable at ${AGENT_BASE}: ${(e as Error).message}`, {
      status: 502,
    });
  }
}
