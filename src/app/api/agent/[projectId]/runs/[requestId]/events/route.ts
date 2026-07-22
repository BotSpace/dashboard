import { NextRequest } from "next/server";
import { AGENT_BASE, agentFetch } from "@/shared/api/agent";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ projectId: string; requestId: string }> },
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
      const fallback = await buildTerminalFallback(
        projectId,
        requestId,
        upstream.status,
      );
      if (fallback) return fallback;
      return new Response(`Upstream error ${upstream.status}`, {
        status: upstream.status,
      });
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
    const fallback = await buildTerminalFallback(projectId, requestId, 502);
    if (fallback) return fallback;
    return new Response(
      `Agent unreachable at ${AGENT_BASE}: ${(e as Error).message}`,
      {
        status: 502,
      },
    );
  }
}

type RunStatusPayload = {
  request_id: string;
  status: string;
  final_response?: string | null;
  error?: string | null;
};

async function buildTerminalFallback(
  projectId: string,
  requestId: string,
  upstreamStatus: number,
): Promise<Response | null> {
  if (upstreamStatus < 500) return null;

  try {
    const statusRes = await agentFetch(
      `/projects/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}`,
    );
    if (!statusRes.ok) return null;

    const run = (await statusRes.json()) as RunStatusPayload;
    if (
      run.status !== "completed" &&
      run.status !== "failed" &&
      run.status !== "cancelled"
    ) {
      return null;
    }

    const chunks: string[] = [];
    if (run.final_response) {
      chunks.push(
        sse("assistant_message", {
          type: "assistant_message",
          payload: { text: run.final_response, usage: {} },
          at: new Date().toISOString(),
        }),
      );
    }
    if (run.status === "completed") {
      chunks.push(
        sse("run_completed", {
          type: "run_completed",
          payload: { request_id: run.request_id },
          at: new Date().toISOString(),
        }),
      );
    } else {
      const cancelled =
        run.status === "cancelled" ||
        (run.error ?? run.final_response ?? "").trim().toLowerCase() ===
          "cancelled by user";
      chunks.push(
        sse("run_failed", {
          type: "run_failed",
          payload: {
            error: run.error ?? run.final_response ?? "Run failed",
            cancelled,
          },
          at: new Date().toISOString(),
        }),
      );
    }
    chunks.push(sse("close", { reason: "restored_terminal_state" }));

    return new Response(chunks.join(""), {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return null;
  }
}

function sse(event: string, payload: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}
