import { setRequestLocale } from "next-intl/server";
import { ProjectsAPI } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle>Bot ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Nom" value={bot?.name} />
          <Row label="Username" value={bot?.username ? `@${bot.username}` : "—"} />
          <Row label="Tavsif" value={bot?.description ?? "—"} />
          <Row label="Yaratilgan" value={bot?.created_at ?? "—"} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Holat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Status" value={bot?.status ?? "draft"} />
          <Row label="ID" value={String(bot?.id ?? id)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value || "—"}</span>
    </div>
  );
}
