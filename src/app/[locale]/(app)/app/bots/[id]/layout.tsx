import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectsAPI } from "@/shared/api/services";
import { BotTabs } from "@/features/bots/components/bot-tabs";
import { ConstructorButton } from "@/features/bots/components/constructor-button";
import { EditableBotName } from "@/features/bots/components/editable-bot-name";
import { Link } from "@/shared/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { initials } from "@/shared/lib/utils";

function StatusDot({ status }: { status?: string | null }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-emerald-500/10 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-400">
        <span className="h-[5px] w-[5px] rounded-full bg-emerald-400" />
        Active
      </span>
    );
  }
  if (status === "stopped" || status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-red-500/10 px-2.5 py-1 text-[11.5px] font-semibold text-red-400">
        <span className="h-[5px] w-[5px] rounded-full bg-red-400" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-amber-500/[0.12] px-2.5 py-1 text-[11.5px] font-semibold text-amber-400">
      <span className="h-[5px] w-[5px] rounded-full bg-amber-400" />
      {status ?? "draft"}
    </span>
  );
}

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
    <div>
      {/* Back link */}
      <div className="px-0 pb-4">
        <Link
          href="/app/bots"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {tNav("bots")}
        </Link>
      </div>

      {/* Bot header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[15px]">
          {/* Avatar — gradient fallback like mockup */}
          <Avatar className="h-[54px] w-[54px] shrink-0 rounded-[14px]">
            {bot.avatar && <AvatarImage src={bot.avatar} alt={bot.name} className="rounded-[14px]" />}
            <AvatarFallback
              className="rounded-[14px] bg-gradient-to-br from-blue-500 to-blue-700 text-[19px] font-semibold text-white"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              {initials(bot.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2.5">
              <EditableBotName id={id} initialName={bot.name} />
              <StatusDot status={bot.status} />
            </div>
            {bot.username && (
              <p className="mt-[3px] text-[13px] text-muted-foreground">@{bot.username}</p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <ConstructorButton botId={id} />
        </div>
      </div>

      {/* Tabs */}
      <BotTabs id={id} />

      <div className="pt-6">{children}</div>
    </div>
  );
}
