import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/shared/lib/env";
import { ACCESS_TOKEN_TTL_SEC, REFRESH_TOKEN_TTL_SEC } from "@/shared/lib/constants";

export type SessionUser = {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
};

export type SessionPayload = {
  access: string;
  refresh: string;
  user: SessionUser;
};

export function userDisplayName(u?: SessionUser | null): string {
  if (!u) return "";
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return full || u.username || u.email || u.phone || "";
}

const secret = () => new TextEncoder().encode(env.SESSION_SECRET);

export async function encodeSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_SEC}s`)
    .sign(secret());
}

export async function decodeSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await encodeSession(payload);
  const store = await cookies();
  store.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SEC,
    // When set (e.g. ".botspace.uz") the cookie is shared across subdomains
    // — used so the constructor panel reads the same session.
    ...(env.SESSION_COOKIE_DOMAIN ? { domain: env.SESSION_COOKIE_DOMAIN } : {}),
  });
}

/** Registrable parent domain derived from the request host, e.g.
 *  `app.botmother.uz` → `.botmother.uz`. Returns null for localhost/IPs. */
async function parentDomainFromHost(): Promise<string | null> {
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "").split(":")[0].trim().toLowerCase();
    if (!host || host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
    const labels = host.split(".");
    if (labels.length < 2) return null;
    return "." + labels.slice(-2).join(".");
  } catch {
    return null;
  }
}

export async function clearSessionCookie() {
  const store = await cookies();
  const name = env.SESSION_COOKIE_NAME;
  // The session cookie is shared across several frontends on one parent domain
  // (e.g. ".botmother.uz") via a domain-scoped cookie. A clear only works if the
  // expiring Set-Cookie matches the SAME domain + path. We therefore expire it
  // under every plausible scope so logout works regardless of how it was set:
  //   1) host-scoped (no domain) — local dev / legacy single-frontend cookie
  //   2) the configured SESSION_COOKIE_DOMAIN
  //   3) the registrable parent domain derived from the request host — covers
  //      the shared multi-frontend cookie even if this service's env is unset.
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  store.set(name, "", base);
  store.delete(name);

  const domains = new Set<string>();
  if (env.SESSION_COOKIE_DOMAIN) domains.add(env.SESSION_COOKIE_DOMAIN);
  const parent = await parentDomainFromHost();
  if (parent) domains.add(parent);

  for (const domain of domains) {
    store.set(name, "", { ...base, domain });
  }
}

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function readAccessToken(): Promise<string | null> {
  const s = await readSession();
  return s?.access ?? null;
}

export { ACCESS_TOKEN_TTL_SEC };
