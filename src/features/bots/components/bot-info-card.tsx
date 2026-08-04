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
    <Badge variant="secondary" className="min-w-0 max-w-full gap-1 text-emerald-500">
      <Rocket className="h-3 w-3 shrink-0" />
      <span className="truncate">{t("modeRelease")}</span>
    </Badge>
  ) : debugBot ? (
    <Badge variant="secondary" className="min-w-0 max-w-full gap-1 text-amber-500">
      <Sparkles className="h-3 w-3 shrink-0" />
      <span className="truncate">{t("modeDebug")}</span>
    </Badge>
  ) : null;

  return (
    <>
      <Section
        title={t("title")}
        icon={<Bot className="h-4 w-4 text-blue-400" />}
        className="min-w-0"
        contentClassName="min-w-0 space-y-3 text-sm"
        actions={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            title={t("changeBot")}
            aria-label={t("changeBot")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-border/50 pb-2">
          <span className="text-muted-foreground">{t("usernameLabel")}</span>
          {username ? (
            <a
              href={`https://telegram.me/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 max-w-full items-center justify-self-end gap-1 overflow-hidden font-medium text-primary hover:underline"
            >
              <span className="truncate">@{username}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <span className="truncate justify-self-end text-xs italic text-muted-foreground/70">
              {t("noUsername")}
            </span>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 pb-1">
          <span className="text-muted-foreground">{t("modeLabel")}</span>
          <span className="min-w-0 max-w-full justify-self-end overflow-hidden">
          {modeBadge ?? (
            <span className="block truncate text-xs italic text-muted-foreground/70">{t("noUsername")}</span>
          )}
          </span>
        </div>
      </Section>

      <BotTokenDialog open={open} onClose={() => setOpen(false)} projectId={projectId} />
    </>
  );
}
