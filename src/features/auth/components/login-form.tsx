"use client";
import { useTranslations } from "next-intl";
import { TelegramLogin } from "./telegram-login";
import { GoogleButton } from "./google-button";

export function LoginForm({ from }: { from?: string }) {
  const t = useTranslations("auth");
  return (
    <div className="space-y-6">
      <TelegramLogin from={from} />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <span className="relative mx-auto block w-fit bg-background px-2 text-xs uppercase text-muted-foreground">
          {t("login.or")}
        </span>
      </div>
      <GoogleButton label={t("login.google")} />
    </div>
  );
}
