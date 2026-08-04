import { getTranslations, setRequestLocale } from "next-intl/server";
import { Info, Activity } from "lucide-react";
import { ProjectsAPI } from "@/shared/api/services";
import { Section } from "@/shared/components/common/section";
import { CopyButton } from "@/shared/components/common/copy-button";
import { DangerZone } from "@/features/bots/components/danger-zone";
import { BotInfoCard } from "@/features/bots/components/bot-info-card";
import { formatLongDate } from "@/shared/lib/utils";

export default async function BotOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bots.overview");
  const bot = await ProjectsAPI.get(id).catch(() => null);

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <div className="min-w-0 lg:col-span-2">
        <BotInfoCard
          projectId={id}
          username={bot?.username ?? bot?.bot_username}
          releaseBot={bot?.bot_mode === "release"}
          debugBot={bot?.bot_mode === "debug"}
        />
      </div>

      <Section
        title={t("info")}
        icon={<Info className="h-4 w-4 text-blue-400" />}
        className="min-w-0"
        contentClassName="min-w-0 space-y-3 text-sm"
      >
        <Row label={t("name")} value={bot?.name} />
        <Row
          label={t("username")}
          value={bot?.username ? `@${bot.username}` : undefined}
          hint={t("noUsername")}
        />
        <Row
          label={t("description")}
          value={bot?.description || undefined}
          hint={t("noDescription")}
        />
      </Section>

      <Section
        title={t("state")}
        icon={<Activity className="h-4 w-4 text-emerald-400" />}
        className="min-w-0"
        contentClassName="min-w-0 space-y-3 text-sm"
      >
        <Row label={t("status")} value={bot?.debug?.status ?? bot?.bot_mode ?? "draft"} />
        <Row label={t("id")} value={String(bot?.id ?? id)} copy />
        <Row label={t("created")} value={bot?.created_at ? formatLongDate(bot.created_at, locale) : undefined} />
      </Section>

      <div className="min-w-0 lg:col-span-2">
        <DangerZone id={id} locale={locale} name={bot?.name} />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  copy,
  hint,
}: {
  label: string;
  value?: string;
  copy?: boolean;
  hint?: string;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center justify-self-end gap-1.5 overflow-hidden">
        {value ? (
          <span className="truncate font-medium">{value}</span>
        ) : (
          <span className="truncate text-xs italic text-muted-foreground/70">
            {hint ?? "—"}
          </span>
        )}
        {copy && value ? <CopyButton value={value} className="p-1" /> : null}
      </span>
    </div>
  );
}
