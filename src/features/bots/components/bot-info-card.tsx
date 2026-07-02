"use client";
import { useState } from "react";
import { Bot, ExternalLink, Pencil, Rocket, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/shared/components/common/section";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { BotTokenDialog } from "@/features/bots/components/bot-token-dialog";

interface Props {
  projectId: string | number;
  username?: string | null;
  releaseBot?: boolean;
  debugBot?: boolean;
}

// Bot detail (overview) sahifasidagi "Bot" bo'limi — @username, joriy ulanish
// rejimi (release / sinov) va "Botni o'zgartirish" tugmasi. Tugma bosilganda
// BotTokenDialog ochiladi — o'sha komponent DeployButton'dagi bilan bir xil
// (Telegram orqali / Token qo'lda), shu yerda token yo'q/eski holatdan
// qat'i nazar qayta ulash uchun ishlatiladi.
export function BotInfoCard({ projectId, username, releaseBot, debugBot }: Props) {
  const t = useTranslations("bots.botToken.botInfo");
  const [open, setOpen] = useState(false);

  const modeBadge = releaseBot ? (
    <Badge variant="secondary" className="gap-1 text-emerald-500">
      <Rocket className="h-3 w-3" />
      {t("modeRelease")}
    </Badge>
  ) : debugBot ? (
    <Badge variant="secondary" className="gap-1 text-amber-500">
      <Sparkles className="h-3 w-3" />
      {t("modeDebug")}
    </Badge>
  ) : null;

  return (
    <>
      <Section
        title={t("title")}
        icon={<Bot className="h-4 w-4 text-blue-400" />}
        contentClassName="space-y-3 text-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2">
          <span className="text-muted-foreground">{t("usernameLabel")}</span>
          {username ? (
            <a
              href={`https://t.me/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              @{username}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="truncate text-xs italic text-muted-foreground/70">
              {t("noUsername")}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pb-1">
          <span className="text-muted-foreground">{t("modeLabel")}</span>
          {modeBadge ?? (
            <span className="text-xs italic text-muted-foreground/70">{t("noUsername")}</span>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          {t("changeBot")}
        </Button>
      </Section>

      <BotTokenDialog open={open} onClose={() => setOpen(false)} projectId={projectId} />
    </>
  );
}
