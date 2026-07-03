// Google login — ROUTE HANDLER (server action emas). GSI callback id_token'ni shu
// route'ga POST qiladi; route backend bilan login qilib, sessiya cookie'sini
// JSON javobga yozadi (server action cookies().set() ni brauzerga qo'llamasdi).
import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/shared/api/client";
import { encodeSession, type SessionUser } from "@/shared/auth/session";
import { env } from "@/shared/lib/env";
import { REFRESH_TOKEN_TTL_SEC } from "@/shared/lib/constants";

export async function POST(req: NextRequest) {
  let idToken = "";
  try {
    idToken = ((await req.json()) as { id_token?: string })?.id_token ?? "";
  } catch {
    /* bo'sh body */
  }
  if (!idToken) {
    return NextResponse.json({ ok: false, message: "id_token yo'q" }, { status: 400 });
  }

  try {
    // NOTE: the Go backend (internal/modules/auth) does not expose a Google
    // OAuth endpoint yet — only phone+password and the Telegram authbot flow
    // (see internal/modules/auth/routes.go, internal/modules/authbot/routes.go).
    // This call 404s until that's ported; caught below and surfaced as a
    // normal login failure instead of crashing.
    const res = await apiFetch<Record<string, unknown>>("/api/v1/auth/google", {
      method: "POST",
      json: { id_token: idToken },
      skipAuth: true,
    });
    const token = (res.token as Record<string, unknown>) ?? res;
    const access = (token?.access_token as string) ?? (res.access_token as string);
    const refresh = (token?.refresh_token as string) ?? (res.refresh_token as string);
    if (!access || !refresh) {
      return NextResponse.json({ ok: false, message: "Tokenlar kelmadi" }, { status: 400 });
    }
    const user = ((res.user as SessionUser) ?? ({ id: 0 } as SessionUser)) as SessionUser;
    const value = await encodeSession({ access, refresh, user });

    const out = NextResponse.json({ ok: true });
    out.cookies.set(env.SESSION_COOKIE_NAME, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_TTL_SEC,
      ...(env.SESSION_COOKIE_DOMAIN ? { domain: env.SESSION_COOKIE_DOMAIN } : {}),
    });
    return out;
  } catch {
    return NextResponse.json({ ok: false, message: "Google login amalga oshmadi" }, { status: 401 });
  }
}
