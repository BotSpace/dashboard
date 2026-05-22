"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { OTPInput, type SlotProps } from "input-otp";
import { telegramLoginAction, type ActionState } from "@/features/auth/actions";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { env } from "@/shared/lib/env";
import { OTP_LENGTH } from "@/shared/lib/constants";

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "relative flex h-12 w-10 items-center justify-center rounded-md border bg-background text-xl font-semibold shadow-sm sm:w-12",
        props.isActive && "ring-2 ring-ring"
      )}
    >
      {props.char ?? (props.hasFakeCaret ? <span className="h-5 w-px animate-pulse bg-foreground" /> : null)}
    </div>
  );
}

export function TelegramLogin({ from }: { from?: string }) {
  const t = useTranslations("auth.telegram");
  const router = useRouter();
  const locale = useLocale();
  const [code, setCode] = useState("");
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    telegramLoginAction,
    undefined
  );

  useEffect(() => {
    if (state?.ok) {
      const target = from && from.startsWith("/") ? from : `/${locale}/app`;
      router.push(target);
      router.refresh();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, from, locale, router]);

  const botUsername = env.NEXT_PUBLIC_TELEGRAM_BOT;
  const botUrl = `https://t.me/${botUsername}`;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <a
        href={botUrl}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition hover:border-primary/40"
      >
        <div className="grid h-10 w-10 place-items-center rounded-md bg-[#229ED9] text-white">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">@{botUsername}</div>
          <div className="text-xs text-muted-foreground">{t("openBot")}</div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
      </a>

      <form action={action} className="space-y-4">
        <input type="hidden" name="code" value={code} />
        <div className="space-y-3">
          <p className="text-center text-xs text-muted-foreground">{t("enterCode")}</p>
          <div className="flex justify-center">
            <OTPInput
              maxLength={OTP_LENGTH}
              value={code}
              onChange={setCode}
              containerClassName="flex items-center gap-2"
              render={({ slots }) => (
                <div className="flex gap-2">
                  {slots.map((s, i) => (
                    <Slot key={i} {...s} />
                  ))}
                </div>
              )}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={pending || code.length !== OTP_LENGTH}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
