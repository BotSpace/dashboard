// Telegram "Kirish 🔐" avto-login — ROUTE HANDLER (server action emas).
// Server action cookies().set() ni brauzerga ishonchli qo'llamasdi; route handler
// esa Set-Cookie'ni redirect javobida doim chiqaradi.
//
// MUHIM (prod): nginx/gateway orqasida req.nextUrl.origin "http://localhost:3010"
// bo'lib qoladi → redirect noto'g'ri origin'ga ketadi. Shuning uchun base URL
// x-forwarded-host/proto header'laridan olinadi. Cookie esa redirect javob
// obyektiga to'g'ridan-to'g'ri (res.cookies.set) yoziladi — kafolatli.
import { NextRequest, NextResponse } from "next/server";
import { apiFetch, isApiError } from "@/shared/api/client";
import { encodeSession, type SessionUser } from "@/shared/auth/session";
import { env } from "@/shared/lib/env";
import { REFRESH_TOKEN_TTL_SEC } from "@/shared/lib/constants";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const code = (sp.get("code") ?? "").trim();
  const callbackUrl = (sp.get("callbackUrl") ?? "").trim();
  const locale = (sp.get("locale") ?? "uz").trim() || "uz";

  // RELATIV Location: brauzer uni joriy URL (https://botspace.uz/api/auth/telegram)
  // ga nisbatan hal qiladi — origin taxmin qilish shart emas. NextResponse.redirect
  // absolyut URL talab qiladi, shuning uchun javobni qo'lda quramiz. Bu nginx/gateway
  // orqasida req.nextUrl.origin "localhost:3010" bo'lib qolishi muammosini butunlay yo'q qiladi.
  const redirectTo = (path: string) =>
    new NextResponse(null, { status: 307, headers: { Location: path } });
  const toLogin = (msg?: string) =>
    redirectTo(`/${locale}/login${msg ? `?error=${encodeURIComponent(msg)}` : ""}`);

  if (!/^\d{6}$/.test(code)) return toLogin("Kod yaroqsiz");

  let value: string;
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
    value = await encodeSession({ access, refresh, user });
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

  const res = redirectTo(target);
  res.cookies.set(env.SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SEC,
    ...(env.SESSION_COOKIE_DOMAIN ? { domain: env.SESSION_COOKIE_DOMAIN } : {}),
  });
  return res;
}
