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

function buildUrl(path: string, query?: ApiOptions["query"]): string {
  const root = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const full = path.startsWith("/") ? root + path : root + "/" + path;
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

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  for (const key of ["detail", "message", "error", "errors"]) {
    const v = d[key];
    if (typeof v === "string") return v;
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  }
  return undefined;
}

export function isApiError(e: unknown): e is ApiError {
  return Boolean(e && typeof e === "object" && "status" in e && "message" in e);
}
