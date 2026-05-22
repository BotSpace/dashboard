import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/shared/i18n/routing";
import { env } from "@/shared/lib/env";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/app"];
const AUTH_PAGES = ["/login"];

function stripLocale(pathname: string): { locale: string | null; rest: string } {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && (routing.locales as readonly string[]).includes(segments[0])) {
    return { locale: segments[0], rest: "/" + segments.slice(1).join("/") };
  }
  return { locale: null, rest: pathname };
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, rest } = stripLocale(pathname);

  const isProtected = PROTECTED_PREFIXES.some((p) => rest === p || rest.startsWith(p + "/"));
  const isAuthPage = AUTH_PAGES.some((p) => rest === p);

  const session = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;
  const isAuthed = Boolean(session);

  if (isProtected && !isAuthed) {
    const loginUrl = new URL(`/${locale ?? routing.defaultLocale}/login`, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL(`/${locale ?? routing.defaultLocale}/app`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
