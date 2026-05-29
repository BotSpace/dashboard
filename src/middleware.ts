import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { routing } from "@/shared/i18n/routing";
import { env } from "@/shared/lib/env";
import { REFRESH_TOKEN_TTL_SEC } from "@/shared/lib/constants";

const intlMiddleware = createMiddleware(routing);
const sessionSecret = () => new TextEncoder().encode(env.SESSION_SECRET);

const PROTECTED_PREFIXES = ["/app"];
const AUTH_PAGES = ["/login"];

// Refresh access token if it expires within this many seconds.
const REFRESH_BUFFER_SEC = 60;

type SessionPayload = {
  access: string;
  refresh: string;
  user: Record<string, unknown>;
};

function stripLocale(pathname: string): { locale: string | null; rest: string } {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && (routing.locales as readonly string[]).includes(segments[0])) {
    return { locale: segments[0], rest: "/" + segments.slice(1).join("/") };
  }
  return { locale: null, rest: pathname };
}

function decodeAccessExp(access: string): number | null {
  try {
    const parts = access.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

async function refreshTokens(
  refresh: string
): Promise<{ access: string; refresh: string } | null> {
  try {
    const url = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "") + "/auth/token/refresh/";
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const data = (await r.json()) as Record<string, unknown>;
    const root =
      (data?.data && typeof data.data === "object"
        ? (data.data as Record<string, unknown>)
        : data) ?? {};
    const token =
      (root?.token && typeof root.token === "object"
        ? (root.token as Record<string, unknown>)
        : root) ?? {};
    const access = (token?.access ?? root?.access) as string | undefined;
    const newRefresh =
      ((token?.refresh ?? root?.refresh) as string | undefined) ?? refresh;
    if (!access) return null;
    return { access, refresh: newRefresh };
  } catch {
    return null;
  }
}

async function encodeSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_SEC}s`)
    .sign(sessionSecret());
}

type SessionState =
  | { kind: "none" }
  | { kind: "valid"; session: SessionPayload }
  | { kind: "refreshed"; session: SessionPayload; cookie: string }
  | { kind: "broken" };

async function loadSession(cookieValue: string | undefined): Promise<SessionState> {
  if (!cookieValue) return { kind: "none" };

  let payload: SessionPayload;
  try {
    const { payload: p } = await jwtVerify(cookieValue, sessionSecret());
    payload = p as unknown as SessionPayload;
  } catch {
    return { kind: "broken" };
  }
  if (!payload?.access || !payload?.refresh) return { kind: "broken" };

  const exp = decodeAccessExp(payload.access);
  const now = Math.floor(Date.now() / 1000);
  const accessAlreadyExpired = exp !== null && exp <= now;
  const needsRefresh = exp === null || exp - now <= REFRESH_BUFFER_SEC;
  if (!needsRefresh) return { kind: "valid", session: payload };

  const next = await refreshTokens(payload.refresh);
  if (!next) {
    // Refresh failed. Common cause: race condition between parallel
    // middleware passes (page HTML + RSC payload, multiple tabs) — the
    // backend rotates+blacklists the refresh token on first call, the
    // second call sees a blacklisted token and 401s. If the access token
    // itself is still usable, fall back to it instead of logging the user
    // out. Only treat refresh failure as "broken" when the access token
    // is hard-expired and we genuinely have nothing usable left.
    if (accessAlreadyExpired) return { kind: "broken" };
    return { kind: "valid", session: payload };
  }

  const refreshed: SessionPayload = { ...payload, ...next };
  const cookie = await encodeSession(refreshed);
  return { kind: "refreshed", session: refreshed, cookie };
}

function applySessionCookie(response: NextResponse, value: string) {
  response.cookies.set(env.SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SEC,
    ...(env.SESSION_COOKIE_DOMAIN ? { domain: env.SESSION_COOKIE_DOMAIN } : {}),
  });
}

function clearSessionCookie(response: NextResponse) {
  if (env.SESSION_COOKIE_DOMAIN) {
    response.cookies.set(env.SESSION_COOKIE_NAME, "", {
      maxAge: 0,
      path: "/",
      domain: env.SESSION_COOKIE_DOMAIN,
    });
    return;
  }
  response.cookies.delete(env.SESSION_COOKIE_NAME);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, rest } = stripLocale(pathname);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => rest === p || rest.startsWith(p + "/")
  );
  const isAuthPage = AUTH_PAGES.some((p) => rest === p);

  const cookieValue = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;
  const state = await loadSession(cookieValue);

  // Forward refreshed cookie value so downstream RSC reads the new tokens.
  if (state.kind === "refreshed") {
    request.cookies.set(env.SESSION_COOKIE_NAME, state.cookie);
  }

  const isAuthed = state.kind === "valid" || state.kind === "refreshed";

  if (isProtected && !isAuthed) {
    const loginUrl = new URL(
      `/${locale ?? routing.defaultLocale}/login`,
      request.url
    );
    loginUrl.searchParams.set("from", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    if (state.kind === "broken") clearSessionCookie(redirect);
    return redirect;
  }

  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(
      new URL(`/${locale ?? routing.defaultLocale}/app`, request.url)
    );
  }

  const response = intlMiddleware(request) ?? NextResponse.next();
  if (state.kind === "refreshed") applySessionCookie(response, state.cookie);
  if (state.kind === "broken") clearSessionCookie(response);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
