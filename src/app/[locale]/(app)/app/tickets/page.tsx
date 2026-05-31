import { getTranslations, setRequestLocale } from "next-intl/server";
import { LifeBuoy, Plus } from "lucide-react";
import { TicketsAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "@/shared/i18n/routing";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";

export default async function TicketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tickets");
  const items = await TicketsAPI.list().catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        icon={<LifeBuoy className="h-5 w-5" />}
        actions={
          <Button asChild className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
            <Link href="/app/tickets/new">
              <Plus className="h-4 w-4" /> {t("new")}
            </Link>
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="h-7 w-7" />}
          title={t("empty")}
          action={
            <Button asChild className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
              <Link href="/app/tickets/new">
                <Plus className="h-4 w-4" /> {t("new")}
              </Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {items.map((tk) => (
                <li key={tk.id}>
                  <Link
                    href={`/app/tickets/${tk.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{tk.subject}</div>
                      <div className="text-xs text-muted-foreground">{tk.created_at ?? "—"}</div>
                    </div>
                    <Badge variant={tk.status === "open" ? "warn" : "secondary"}>{t(tk.status)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
