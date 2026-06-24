"use client";

// Telegram bot "Kirish 🔐" tugmasi shu sahifaga olib keladi:
//   /<locale>/auth?callbackUrl=%2F&code=<6 xonali kod>
// Sahifa to'g'ridan-to'g'ri /api/auth/telegram ROUTE HANDLER'iga navigatsiya qiladi.
// MUHIM: sessiya cookie'sini route handler o'rnatadi (server action'da Set-Cookie
// brauzerga ishonchli tushmasdi). Route handler login → setSessionCookie → redirect.

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";

function AutoLogin() {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const code = (params.get("code") ?? "").trim();
    const callbackUrl = params.get("callbackUrl") ?? "";

    if (!/^\d{6}$/.test(code)) {
      router.replace(`/${locale}/login`);
      return;
    }

    // To'liq navigatsiya (router emas) — route handler Set-Cookie + redirect qiladi.
    const url =
      `/api/auth/telegram?code=${encodeURIComponent(code)}` +
      `&callbackUrl=${encodeURIComponent(callbackUrl)}` +
      `&locale=${encodeURIComponent(locale)}`;
    window.location.replace(url);
  }, [params, router, locale]);

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        <p className="text-sm text-white/60">Kirilyapti…</p>
      </div>
    </div>
  );
}

export default function AuthAutoLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      }
    >
      <AutoLogin />
    </Suspense>
  );
}
