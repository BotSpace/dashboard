import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import { TicketsAPI } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";

const STATUS_VARIANT: Record<string, "warn" | "secondary"> = {
  open: "warn",
  pending: "warn",
  closed: "secondary",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tickets");

  const ticket = await TicketsAPI.get(id).catch(() => null);
  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={`#${ticket.id}`}
        icon={<LifeBuoy className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/app/tickets">
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{ticket.created_at ?? "—"}</p>
          </div>
          <Badge variant={STATUS_VARIANT[ticket.status] ?? "secondary"}>
            {t.has(ticket.status) ? t(ticket.status) : ticket.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {ticket.message || "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
