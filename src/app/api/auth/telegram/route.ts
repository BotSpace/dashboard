// Telegram "Kirish 🔐" avto-login — ROUTE HANDLER (server action emas).
// Sabab: server action'da cookies().set() brauzerga ishonchli qo'llanmasdi
// (imperativ chaqiruvda Set-Cookie tushmasdi). Route handler esa setSessionCookie
// + NextResponse.redirect bilan Set-Cookie'ni doim chiqaradi (sinab tasdiqlandi).
//
// Telegram bot link: https://botspace.uz/<locale>/auth?code=... → /auth sahifa
// shu route'ga to'liq navigatsiya qiladi: /api/auth/telegram?code=&callbackUrl=&locale=
import { NextRequest, NextResponse } from "next/server";
import { apiFetch, isApiError } from "@/shared/api/client";
import { setSessionCookie, type SessionUser } from "@/shared/auth/session";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const code = (sp.get("code") ?? "").trim();
  const callbackUrl = (sp.get("callbackUrl") ?? "").trim();
  const locale = (sp.get("locale") ?? "uz").trim() || "uz";
  const origin = req.nextUrl.origin;

  const toLogin = (msg?: string) =>
    NextResponse.redirect(
      new URL(`/${locale}/login${msg ? `?error=${encodeURIComponent(msg)}` : ""}`, origin),
    );

  if (!/^\d{6}$/.test(code)) return toLogin("Kod yaroqsiz");

  try {
    const res = await apiFetch<Record<string, unknown>>("/authbot/login/", {
      method: "POST",
      json: { code: Number(code) },
      skipAuth: true,
    });
    const root = (res?.data && typeof res.data === "object" ? res.data : res) as Record<string, unknown>;
    const token = (root.token as Record<string, unknown>) ?? root;
    const access = (token?.access as string) ?? (root.access as string);
    const refresh = (token?.refresh as string) ?? (root.refresh as string);
    if (!access || !refresh) return toLogin("Tokenlar kelmadi");
    const user = ((root.user as SessionUser) ?? ({ id: 0 } as SessionUser)) as SessionUser;
    await setSessionCookie({ access, refresh, user });
  } catch (e) {
    const msg = isApiError(e)
      ? e.message || "Kod noto'g'ri yoki muddati o'tgan"
      : "Server bilan bog'lanib bo'lmadi";
    return toLogin(msg);
  }

  const target =
    callbackUrl && callbackUrl.startsWith("/") && callbackUrl !== "/"
      ? `/${locale}${callbackUrl}`
      : `/${locale}/app`;
  return NextResponse.redirect(new URL(target, origin));
}
