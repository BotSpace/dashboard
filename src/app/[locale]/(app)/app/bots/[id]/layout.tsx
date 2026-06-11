import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectsAPI } from "@/shared/api/services";
import { BotTabs } from "@/features/bots/components/bot-tabs";
import { ConstructorButton } from "@/features/bots/components/constructor-button";
import { EditableBotName } from "@/features/bots/components/editable-bot-name";
import { Link } from "@/shared/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
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
    <div className="space-y-6">
      <Link
        href="/app/bots"
        className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {tNav("bots")}
      </Link>

      <header className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-card p-5">
        <Avatar className="h-14 w-14 ring-2 ring-blue-500/20 shrink-0">
          {bot.avatar && <AvatarImage src={bot.avatar} alt={bot.name} />}
          <AvatarFallback className="text-sm font-semibold">{initials(bot.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <EditableBotName id={id} initialName={bot.name} />
            <Badge variant={bot.status === "active" ? "success" : "secondary"} className="text-[11px]">
              {bot.status ?? "draft"}
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
      <div className="pt-6">{children}</div>
    </div>
  );
}
