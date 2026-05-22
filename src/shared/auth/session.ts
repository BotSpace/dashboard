import { cookies } from "next/headers";
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
    // When set (e.g. ".botmother.uz") the cookie is shared across subdomains
    // — used so the constructor panel reads the same session.
    ...(env.SESSION_COOKIE_DOMAIN ? { domain: env.SESSION_COOKIE_DOMAIN } : {}),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(env.SESSION_COOKIE_NAME);
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
