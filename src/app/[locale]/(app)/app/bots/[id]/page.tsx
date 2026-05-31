import { setRequestLocale } from "next-intl/server";
import { Info, Activity } from "lucide-react";
import { ProjectsAPI } from "@/shared/api/services";
import { Section } from "@/shared/components/common/section";

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
        icon={<Info className="h-4 w-4 text-violet-400" />}
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
