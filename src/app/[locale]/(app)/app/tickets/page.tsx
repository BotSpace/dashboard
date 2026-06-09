import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, Clock, LifeBuoy, MessageSquare, Plus } from "lucide-react";
import { TicketsAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "@/shared/i18n/routing";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";

const STATUS_META: Record<string, { variant: "warn" | "default" | "secondary"; icon: typeof Clock }> = {
  open: { variant: "warn", icon: Clock },
  pending: { variant: "warn", icon: Clock },
  closed: { variant: "secondary", icon: CheckCircle2 },
};

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
          <Button asChild className="gap-2">
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
            <Button asChild className="gap-2">
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
              {items.map((tk) => {
                const meta = STATUS_META[tk.status] ?? STATUS_META.open;
                const Icon = meta.icon;
                return (
                  <li key={tk.id}>
                    <Link
                      href={`/app/tickets/${tk.id}`}
                      className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30"
                    >
                      <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-500/10 text-blue-500">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="truncate font-medium">{tk.subject}</span>
                        {tk.last_message && (
                          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                            {tk.last_message.sender === "admin" && (
                              <span className="font-medium text-blue-500">Support: </span>
                            )}
                            {tk.last_message.message}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">{tk.created_at ?? "—"}</p>
                      </div>
                      <Badge variant={meta.variant} className="mt-0.5 shrink-0 gap-1">
                        <Icon className="h-3 w-3" />
                        {t.has(tk.status) ? t(tk.status) : tk.status}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
