import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectsAPI } from "@/shared/api/services";
import { BotTabs } from "@/features/bots/components/bot-tabs";
import { ConstructorButton } from "@/features/bots/components/constructor-button";
import { EditableBotName } from "@/features/bots/components/editable-bot-name";
import { Link } from "@/shared/i18n/routing";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { initials } from "@/shared/lib/utils";

export default async function BotLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string; id: string }>;
  children: React.ReactNode;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");

  const bot = await ProjectsAPI.get(id).catch(() => null);
  if (!bot) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/app/bots"
        className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {tNav("bots")}
      </Link>

      <header className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <Avatar className="h-11 w-11 shrink-0 border border-border">
          <AvatarFallback className="text-sm font-semibold">{initials(bot.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <EditableBotName id={id} initialName={bot.name} />
            <Badge variant={bot.debug?.status === "running" ? "success" : "secondary"} className="text-[11px]">
              {bot.debug?.status ?? bot.bot_mode ?? "draft"}
            </Badge>
          </div>
          {bot.username && (
            <p className="mt-0.5 text-sm text-muted-foreground">@{bot.username}</p>
          )}
        </div>
        <div className="shrink-0">
          <ConstructorButton botId={id} />
        </div>
      </header>

      <BotTabs id={id} />
      <div className="pt-3">{children}</div>
    </div>
  );
}
