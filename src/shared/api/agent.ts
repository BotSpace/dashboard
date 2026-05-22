import "server-only";
import { env } from "@/shared/lib/env";
import { readSession } from "@/shared/auth/session";
import { SignJWT } from "jose";

const AGENT_BASE = (env.NEXT_PUBLIC_AGENT_URL ?? "http://localhost:8100").replace(/\/$/, "");

async function buildBearer(): Promise<string | null> {
  const session = await readSession();
  if (!session) return null;
  // Sign a short-lived JWT containing user+access for the agent.
  const secret = new TextEncoder().encode(env.SESSION_SECRET);
  const token = await new SignJWT({
    user: { id: session.user.id },
    sub: String(session.user.id),
    access: session.access,
    refresh: session.refresh,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
  return token;
}

async function agentFetch(path: string, init?: RequestInit): Promise<Response> {
  const bearer = await buildBearer();
  if (!bearer) {
    throw new Error("Not authenticated");
  }
  return fetch(AGENT_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: init?.headers ? (init.headers as Record<string, string>).Accept ?? "application/json" : "application/json",
      Authorization: `Bearer ${bearer}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export type AgentRunCreate = {
  prompt: string;
  thread_id?: string;
  baseline_flow?: unknown;
};

export type AgentRunStatus = {
  request_id: string;
  status: string;
  final_response?: string | null;
  error?: string | null;
  pending_approval?: Record<string, unknown> | null;
  pending_clarification?: Record<string, unknown> | null;
  current_plan?: Array<{ id: string; title: string; status: string; notes?: string | null }> | null;
};

export async function createAgentRun(
  projectId: string,
  body: AgentRunCreate
): Promise<{ request_id: string; status: string }> {
  const res = await agentFetch(`/projects/${encodeURIComponent(projectId)}/runs`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`agent create_run failed: ${res.status}`);
  return res.json();
}

export async function getAgentRun(
  projectId: string,
  requestId: string
): Promise<AgentRunStatus> {
  const res = await agentFetch(
    `/projects/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}`
  );
  if (!res.ok) throw new Error(`agent get_run failed: ${res.status}`);
  return res.json();
}

export async function clarifyAgentRun(
  projectId: string,
  requestId: string,
  answer: string
): Promise<void> {
  const res = await agentFetch(
    `/projects/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}/clarify`,
    { method: "POST", body: JSON.stringify({ answer }) }
  );
  if (!res.ok) throw new Error(`agent clarify failed: ${res.status}`);
}

export async function approveAgentRun(
  projectId: string,
  requestId: string,
  approved: boolean,
  reason?: string
): Promise<void> {
  const res = await agentFetch(
    `/projects/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}/approve`,
    { method: "POST", body: JSON.stringify({ approved, reason }) }
  );
  if (!res.ok) throw new Error(`agent approve failed: ${res.status}`);
}

export async function cancelAgentRun(projectId: string, requestId: string): Promise<void> {
  const res = await agentFetch(
    `/projects/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}/cancel`,
    { method: "POST" }
  );
  if (!res.ok && res.status !== 409) {
    throw new Error(`agent cancel failed: ${res.status}`);
  }
}

export function agentEventStreamUrl(
  projectId: string,
  requestId: string,
  sinceSeq: number = 0
): string {
  const q = sinceSeq > 0 ? `?since_seq=${sinceSeq}` : "";
  return `/api/agent/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}/events${q}`;
}

export { AGENT_BASE, agentFetch };
