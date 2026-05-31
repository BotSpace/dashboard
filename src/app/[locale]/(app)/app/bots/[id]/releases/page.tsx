import { getTranslations, setRequestLocale } from "next-intl/server";
import { Rocket } from "lucide-react";
import { ReleasesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { DeployButton } from "@/features/bots/components/deploy-button";
import { EmptyState } from "@/shared/components/common/empty-state";

const statusToVariant = {
  running: "success",
  stopped: "secondary",
  failed: "destructive",
  pending: "warn",
} as const;

export default async function ReleasesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bots.release");
  const releases = await ReleasesAPI.list(id).catch(() => []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DeployButton projectId={id} />
      </div>

      {releases.length === 0 ? (
        <EmptyState
          icon={<Rocket className="h-7 w-7" />}
          title="Hozircha versiyalar yo'q"
          description="Birinchi relizni deploy qiling"
          action={<DeployButton projectId={id} />}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">{t("version")}</th>
                  <th className="px-4 py-3 text-left">{t("status")}</th>
                  <th className="px-4 py-3 text-left">{t("deployedAt")}</th>
                  <th className="px-4 py-3 text-left">Service</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.version ?? r.id}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusToVariant[r.status ?? "pending"] ?? "secondary"}>
                        {r.status ?? "pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.created_at ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.service_id ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
