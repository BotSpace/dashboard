import { ExternalLink } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { env } from "@/shared/lib/env";
import { Button } from "@/shared/components/ui/button";

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
    <Button variant="outline" size="sm" asChild>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="gap-2"
        title={t("openConstructorTooltip")}
      >
        <ExternalLink className="h-4 w-4" />
        {t("openConstructor")}
      </a>
    </Button>
  );
}
