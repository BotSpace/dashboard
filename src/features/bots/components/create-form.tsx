"use client";
import { useActionState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBotAction } from "@/features/bots/actions";
import { Link } from "@/shared/i18n/routing";

type State = { ok: boolean; message?: string } | undefined;

export function CreateBotForm() {
  const t = useTranslations("bots.create");
  const locale = useLocale();
  const [state, action, pending] = useActionState<State, FormData>(createBotAction, undefined);

  useEffect(() => {
    if (state?.ok === false && state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <input type="hidden" name="locale" value={locale} />

      {/* Bot nomi */}
      <div>
        <label
          htmlFor="name"
          className="mb-[7px] block text-[13px] font-medium text-[#c4c4cc]"
        >
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          placeholder={t("namePlaceholder")}
          required
          className="
            w-full rounded-[10px] border border-white/10 bg-white/[0.03]
            px-[14px] py-[11px] text-[14px] text-[#e7e7ea]
            placeholder:text-zinc-600
            focus:outline-none focus:border-blue-500/50
            transition-colors
          "
        />
      </div>

      {/* Tavsif */}
      <div>
        <label
          htmlFor="description"
          className="mb-[7px] block text-[13px] font-medium text-[#c4c4cc]"
        >
          {t("description")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Bot nima ish qiladi?"
          className="
            w-full resize-none rounded-[10px] border border-white/10 bg-white/[0.03]
            px-[14px] py-[11px] text-[14px] text-[#e7e7ea] leading-[1.5]
            placeholder:text-zinc-600
            focus:outline-none focus:border-blue-500/50
            transition-colors
          "
        />
      </div>

      {/* Token */}
      <div>
        <label
          htmlFor="token"
          className="mb-[7px] block text-[13px] font-medium text-[#c4c4cc]"
        >
          {t("token")}
        </label>
        <input
          id="token"
          name="token"
          placeholder={t("tokenPlaceholder")}
          className="
            w-full rounded-[10px] border border-white/10 bg-white/[0.03]
            px-[14px] py-[11px] text-[14px] text-[#e7e7ea] font-mono
            placeholder:text-zinc-600
            focus:outline-none focus:border-blue-500/50
            transition-colors
          "
        />
        <p className="mt-[7px] text-[12px] text-zinc-500">
          {t("tokenHint").split("t.me/BotFather")[0]}
          <Link
            href="https://t.me/BotFather"
            className="text-blue-400 hover:text-blue-300 transition-colors"
            style={{ textDecoration: "none" }}
          >
            t.me/BotFather
          </Link>
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2.5 border-t border-white/[0.06] pt-[18px]">
        <Link
          href="/app/bots"
          className="
            inline-flex items-center rounded-[10px] border border-white/10
            bg-white/[0.03] px-[18px] py-[11px]
            text-[14px] font-medium text-[#c4c4cc]
            hover:bg-white/[0.06] transition-colors
          "
          style={{ textDecoration: "none" }}
        >
          Bekor qilish
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="
            inline-flex items-center gap-2 rounded-[10px]
            bg-blue-600 hover:bg-blue-500 disabled:opacity-60
            px-[18px] py-[11px]
            text-[14px] font-medium text-white
            transition-colors cursor-pointer disabled:cursor-not-allowed
          "
        >
          {pending ? (
            <>
              <Loader2 className="h-[15px] w-[15px] animate-spin" />
              <span>Yaratilmoqda…</span>
            </>
          ) : (
            <>
              <Check className="h-[15px] w-[15px]" />
              <span>{t("submit")}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
