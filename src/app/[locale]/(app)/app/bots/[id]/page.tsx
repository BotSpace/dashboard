import { setRequestLocale } from "next-intl/server";
import { Info, Activity, AlertTriangle } from "lucide-react";
import { ProjectsAPI } from "@/shared/api/services";
import { Section } from "@/shared/components/common/section";
import { DeleteBotButton } from "@/features/bots/components/delete-bot-button";

export default async function BotOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const bot = await ProjectsAPI.get(id).catch(() => null);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section
        title="Bot ma'lumotlari"
        icon={<Info className="h-4 w-4 text-blue-400" />}
        contentClassName="space-y-3 text-sm"
      >
        <Row label="Nom" value={bot?.name} />
        <Row label="Username" value={bot?.username ? `@${bot.username}` : "—"} />
        <Row label="Tavsif" value={bot?.description ?? "—"} />
        <Row label="Yaratilgan" value={bot?.created_at ?? "—"} />
      </Section>

      <Section
        title="Holat"
        icon={<Activity className="h-4 w-4 text-emerald-400" />}
        contentClassName="space-y-3 text-sm"
      >
        <Row label="Status" value={bot?.status ?? "draft"} />
        <Row label="ID" value={String(bot?.id ?? id)} />
      </Section>

      <div className="lg:col-span-2">
        <Section
          title="Xavfli hudud"
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          contentClassName="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Botni o&apos;chirish — bot, uning oqimi va barcha ma&apos;lumotlari
            butunlay yo&apos;qoladi. Qaytarib bo&apos;lmaydi.
          </p>
          <DeleteBotButton id={id} locale={locale} name={bot?.name} />
        </Section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value || "—"}</span>
    </div>
  );
}
