import { getTranslations, setRequestLocale } from "next-intl/server";
import { Rocket } from "lucide-react";
import { ReleasesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { DeployButton } from "@/features/bots/components/deploy-button";
import { ReleasesAutoRefresh } from "@/features/bots/components/releases-auto-refresh";
import { RollbackButton } from "@/features/bots/components/rollback-button";
import { EmptyState } from "@/shared/components/common/empty-state";

const statusToVariant = {
  running: "success",
  stopped: "secondary",
  failed: "destructive",
  pending: "warn",
  init: "warn",
  initializing: "warn",
  stopping: "warn",
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
      <ReleasesAutoRefresh statuses={releases.map((r) => r.status ?? "")} />
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
            <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm">
              <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">{t("version")}</th>
                  <th className="px-4 py-3 text-left">{t("status")}</th>
                  <th className="px-4 py-3 text-left">{t("deployedAt")}</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-right"></th>
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
                    <td className="px-4 py-3 text-right">
                      {r.status !== "running" && (
                        <RollbackButton projectId={id} releaseId={r.id} version={r.version ?? r.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
