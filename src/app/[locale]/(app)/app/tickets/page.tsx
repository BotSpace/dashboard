import { getTranslations, setRequestLocale } from "next-intl/server";
import { LifeBuoy, Plus } from "lucide-react";
import { TicketsAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "@/shared/i18n/routing";

export default async function TicketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tickets");
  const items = await TicketsAPI.list().catch(() => []);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <Button asChild>
          <Link href="/app/tickets/new" className="gap-2">
            <Plus className="h-4 w-4" /> {t("new")}
          </Link>
        </Button>
      </header>
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="grid place-items-center gap-3 py-16">
              <LifeBuoy className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((tk) => (
                <li key={tk.id}>
                  <Link
                    href={`/app/tickets/${tk.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
