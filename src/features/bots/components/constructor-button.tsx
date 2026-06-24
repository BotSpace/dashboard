import { Workflow } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { env } from "@/shared/lib/env";

/**
 * "Open in constructor" CTA shown on bot pages. Opens the standalone
 * constructor app (same origin under /constructor) in a new tab — auth is
 * carried automatically by the shared `bm_session` cookie.
 */
export async function ConstructorButton({ botId }: { botId: string | number }) {
  const constructorBase = env.NEXT_PUBLIC_CONSTRUCTOR_URL;
  if (!constructorBase) return null;

  const t = await getTranslations("bots");
  const locale = await getLocale();
  const url = `${constructorBase.replace(/\/$/, "")}/${locale}/${botId}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={t("openConstructorTooltip")}
      className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-600 px-[18px] py-[11px] text-[14px] font-semibold text-white shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-all hover:brightness-110"
      style={{ fontFamily: "Space Grotesk, sans-serif" }}
    >
      <Workflow className="h-[18px] w-[18px]" />
      {t("openConstructor")}
    </a>
  );
}
