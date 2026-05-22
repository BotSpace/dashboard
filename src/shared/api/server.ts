import "server-only";
import { apiFetch, type ApiOptions } from "./client";
import { readSession } from "@/shared/auth/session";

/**
 * Server-side authenticated fetch.
 *
 * Token refresh lives in `middleware.ts`: it proactively rotates the access
 * token (and the rotated refresh token) onto a fresh session cookie before
 * the request reaches Server Components / Server Actions. By the time `api()`
 * runs, the cookie holds a valid access token, so we just attach it.
 *
 * If a 401 still happens (e.g. token invalidated server-side mid-request)
 * we let it propagate — callers usually wrap it in `.catch(() => fallback)`,
 * and the next navigation's middleware pass will refresh again or redirect
 * to /login if the refresh token is also dead.
 */
export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const session = await readSession();
  if (!session) return apiFetch<T>(path, { ...opts, skipAuth: true });
  return apiFetch<T>(path, { ...opts, token: session.access });
}

export { apiFetch };
