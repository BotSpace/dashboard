import { env } from "@/shared/lib/env";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export type ApiOptions = RequestInit & {
  token?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  skipAuth?: boolean;
};

// Every backend path is authored as "/api/v1/...". Rewrite that leading segment
// to NEXT_PUBLIC_API_PREFIX so prod can point at the gateway's "/api/v2" (-> new
// Go backend's "/api/v1") without touching every call site, while localhost dev
// keeps hitting the real "/api/v1" unchanged.
//
// A path that starts with "/api/" but NOT "/api/v1" (e.g. a missing version
// segment like the old "/api/cms/...") bypasses this rewrite and can only 404 —
// it used to pass through silently and render empty lists. So it now throws in
// every environment so a malformed route can never be sent silently.
const CANONICAL_API_PREFIX = "/api/v1";

export function applyApiPrefix(path: string): string {
  const prefix = env.NEXT_PUBLIC_API_PREFIX;

  if (path === CANONICAL_API_PREFIX || path.startsWith(CANONICAL_API_PREFIX + "/")) {
    return prefix === CANONICAL_API_PREFIX ? path : prefix + path.slice(CANONICAL_API_PREFIX.length);
  }

  if (path.startsWith("/api/")) {
    const msg = `[api] backend path "${path}" must start with "${CANONICAL_API_PREFIX}/" — non-v1 /api path (likely a missing version segment); this request would 404`;
    throw new Error(msg);
  }
  return path;
}

function buildUrl(path: string, query?: ApiOptions["query"]): string {
  const root = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const prefixed = applyApiPrefix(path);
  const full = prefixed.startsWith("/") ? root + prefixed : root + "/" + prefixed;
  if (!query) return full;
  const url = new URL(full);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { token, query, json, headers, skipAuth, ...rest } = opts;
  const url = buildUrl(path, query);

  const h = new Headers(headers ?? {});
  if (json !== undefined && !h.has("content-type")) h.set("content-type", "application/json");
  if (!skipAuth && token) h.set("authorization", `Bearer ${token}`);
  if (!h.has("accept")) h.set("accept", "application/json");

  const init: RequestInit = {
    ...rest,
    headers: h,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: rest.cache ?? "no-store",
  };

  const res = await fetch(url, init);
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: extractMessage(data) || res.statusText || "Request failed",
      details: data,
    };
    throw err;
  }
  return data as T;
}

/** Go backend's error envelope (internal/shared/httpx.ErrorResponse): `{ error: { code, message, details } }`. */
type BackendErrorBody = { code?: string; message?: string; details?: unknown };

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown> & { error?: BackendErrorBody };
  if (d.error && typeof d.error === "object") {
    const msg = d.error.message;
    if (typeof msg === "string" && msg) return msg;
  }
  return undefined;
}

/** Machine-readable error code from the Go backend's envelope, e.g. "auth.invalid_token". */
export function apiErrorCode(e: unknown): string | undefined {
  if (!isApiError(e)) return undefined;
  const d = e.details as { error?: BackendErrorBody } | undefined;
  return d?.error?.code;
}

export function isApiError(e: unknown): e is ApiError {
  return Boolean(e && typeof e === "object" && "status" in e && "message" in e);
}
