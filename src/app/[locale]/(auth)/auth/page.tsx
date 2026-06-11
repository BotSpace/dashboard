"use client";

// Telegram bot "Kirish 🔐" tugmasi shu sahifaga olib keladi:
//   /<locale>/auth?callbackUrl=%2F&code=<6 xonali kod>
// Bu yerda kod avtomatik tekshiriladi (telegramLoginAction → /authbot/login/),
// sessiya cookie o'rnatiladi va foydalanuvchi ilovага yo'naltiriladi.

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";

import { telegramLoginAction } from "@/features/auth/actions";
import { Link } from "@/shared/i18n/routing";

function AutoLogin() {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const ranRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Strict Mode'da effekt ikki marta ishlamasligi uchun guard.
    if (ranRef.current) return;
    ranRef.current = true;

    const code = (params.get("code") ?? "").trim();
    const callbackUrl = params.get("callbackUrl");

    if (!/^\d{6}$/.test(code)) {
      router.replace(`/${locale}/login`);
      return;
    }

    void (async () => {
      const fd = new FormData();
      fd.set("code", code);
      const res = await telegramLoginAction(undefined, fd);
      if (res.ok) {
        const target =
          callbackUrl && callbackUrl.startsWith("/") && callbackUrl !== "/"
            ? `/${locale}${callbackUrl}`
            : `/${locale}/app`;
        router.replace(target);
        router.refresh();
      } else {
        setError(res.message ?? "Kirishda xatolik yuz berdi");
      }
    })();
  }, [params, router, locale]);

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      {error ? (
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-white">Kirib bo&apos;lmadi</p>
            <p className="text-sm text-white/60">{error}</p>
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Qayta urinish
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          <p className="text-sm text-white/60">Kirilyapti…</p>
        </div>
      )}
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
