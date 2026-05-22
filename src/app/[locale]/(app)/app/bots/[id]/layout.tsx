import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { ProjectsAPI } from "@/shared/api/services";
import { BotTabs } from "@/features/bots/components/bot-tabs";
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

  const bot = await ProjectsAPI.get(id).catch(() => null);
  if (!bot) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/app/bots"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Botlar
      </Link>

      <header className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          {bot.avatar && <AvatarImage src={bot.avatar} alt={bot.name} />}
          <AvatarFallback>{initials(bot.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{bot.name}</h1>
            <Badge variant={bot.status === "active" ? "success" : "secondary"}>{bot.status ?? "draft"}</Badge>
          </div>
          {bot.username && <p className="text-sm text-muted-foreground">@{bot.username}</p>}
        </div>
      </header>

      <BotTabs id={id} />
      <div className="pt-6">{children}</div>
    </div>
  );
}
