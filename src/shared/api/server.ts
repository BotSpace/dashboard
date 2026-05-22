import "server-only";
import { apiFetch, type ApiOptions } from "./client";
import { readSession, setSessionCookie, clearSessionCookie, type SessionPayload } from "@/shared/auth/session";

async function refreshAccess(refresh: string): Promise<{ access: string; refresh: string } | null> {
  try {
    const raw = await apiFetch<unknown>("/auth/token/refresh/", {
      method: "POST",
      json: { refresh },
      skipAuth: true,
    });
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const root = (r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r) as Record<string, unknown>;
    const token = root.token as Record<string, unknown> | undefined;
    const access = (token?.access as string | undefined) ?? (root.access as string | undefined);
    const newRefresh = (token?.refresh as string | undefined) ?? (root.refresh as string | undefined) ?? refresh;
    if (!access) return null;
    return { access, refresh: newRefresh };
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
    const status = (e as { status?: number }).status;
    if (status !== 401) throw e;
    const refreshed = await refreshAccess(session.refresh);
    if (!refreshed) {
      await clearSessionCookie();
      throw e;
    }
    const next: SessionPayload = { ...session, access: refreshed.access, refresh: refreshed.refresh };
    await setSessionCookie(next);
    return apiFetch<T>(path, { ...opts, token: refreshed.access });
  }
}

export { apiFetch };
