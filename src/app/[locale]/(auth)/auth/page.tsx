"use client";

// Telegram bot "Kirish 🔐" tugmasi shu sahifaga olib keladi:
//   /<locale>/auth?callbackUrl=%2F&code=<6 xonali kod>
// Kod yashirin <form action={telegramAutoLoginAction}> orqali avtomatik yuboriladi.
// MUHIM: server action'da o'rnatilgan sessiya cookie'si brauzerga FAQAT form-action
// dispatch'i + server-side redirect orqali qo'llanadi. Eski imperativ `await action()`
// Set-Cookie'ni qo'llamasdi — login bo'lib token kelsa ham bm_session o'rnatilmay,
// foydalanuvchi /login'ga qaytib qolardi. Endi action muvaffaqiyatda server-side
// redirect qiladi (cookie redirect javobi bilan qo'llanadi).

import { Suspense, useActionState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";

import { telegramAutoLoginAction, type ActionState } from "@/features/auth/actions";
import { Link } from "@/shared/i18n/routing";

function AutoLogin() {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  const [state, action] = useActionState<ActionState | undefined, FormData>(
    telegramAutoLoginAction,
    undefined,
  );

  const code = (params.get("code") ?? "").trim();
  const callbackUrl = params.get("callbackUrl") ?? "";
  const validCode = /^\d{6}$/.test(code);

  // Yaroqsiz kod → to'g'ridan-to'g'ri login sahifasiga.
  useEffect(() => {
    if (!validCode) router.replace(`/${locale}/login`);
  }, [validCode, locale, router]);

  // Mount'da formani BIR marta yuboramiz. Muvaffaqiyatda action server-side
  // redirect qiladi (shu sahifa o'zi ilovaga o'tib ketadi).
  useEffect(() => {
    if (validCode && !submittedRef.current && formRef.current) {
      submittedRef.current = true;
      formRef.current.requestSubmit();
    }
  }, [validCode]);

  const error = state && !state.ok ? (state.message ?? "Kirishda xatolik yuz berdi") : null;

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      {/* Yashirin auto-submit form — cookie form-action orqali qo'llanishi uchun. */}
      <form ref={formRef} action={action} className="hidden">
        <input type="hidden" name="code" value={code} readOnly />
        <input type="hidden" name="callbackUrl" value={callbackUrl} readOnly />
        <input type="hidden" name="locale" value={locale} readOnly />
      </form>

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
