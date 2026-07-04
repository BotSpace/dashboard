import "server-only";
import { apiFetch, isApiError, type ApiOptions } from "./client";
import { readSession, setSessionCookie } from "@/shared/auth/session";
import { env } from "@/shared/lib/env";

/**
 * Server-side authenticated fetch.
 *
 * Token refresh normally happens proactively in `middleware.ts` on every page
 * navigation. But middleware does NOT run when the page sits idle past the
 * access-token TTL and the user then triggers a request without navigating
 * (a Server Action / button click) — the attached access token is already
 * expired and the backend returns 401 ("invalid or expired token").
 *
 * So `api()` refreshes reactively: on a 401 it rotates the access token with
 * the refresh token and retries the request ONCE. `setSessionCookie` persists
 * the rotation when we're in a mutable context (Server Action); in a read-only
 * Server Component it throws and we swallow it — the retry still uses the fresh
 * token, and the next navigation's middleware persists it. Only if the refresh
 * token itself is dead does the 401 propagate (caller falls back / redirects).
 */

async function refreshAccess(refresh: string): Promise<{ access: string; refresh: string } | null> {
  try {
    // Go backend (internal/modules/auth): POST /auth/refresh { refresh_token }
    // -> { access_token, refresh_token, ... } raw JSON (no envelope).
    const url = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "") + env.NEXT_PUBLIC_API_PREFIX + "/auth/refresh";
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; refresh_token?: string };
    if (!data?.access_token) return null;
    return { access: data.access_token, refresh: data.refresh_token ?? refresh };
  } catch {
    return null;
  }
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const session = await readSession();
  if (!session) return apiFetch<T>(path, { ...opts, skipAuth: true });

  try {
    return await apiFetch<T>(path, { ...opts, token: session.access });
  } catch (e) {
    if (isApiError(e) && e.status === 401 && session.refresh) {
      const refreshed = await refreshAccess(session.refresh);
      if (refreshed) {
        try {
          await setSessionCookie({ ...session, access: refreshed.access, refresh: refreshed.refresh });
        } catch {
          // read-only (Server Component) context — cookie set not allowed; the
          // retry below still uses the fresh token, middleware persists later.
        }
        return await apiFetch<T>(path, { ...opts, token: refreshed.access });
      }
    }
    throw e;
  }
}

export { apiFetch };
