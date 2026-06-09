import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Headset, LifeBuoy, Paperclip } from "lucide-react";
import { TicketsAPI } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";

const STATUS_META: Record<string, { variant: "warn" | "secondary"; icon: typeof Clock }> = {
  open: { variant: "warn", icon: Clock },
  pending: { variant: "warn", icon: Clock },
  closed: { variant: "secondary", icon: CheckCircle2 },
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

  const meta = STATUS_META[ticket.status] ?? STATUS_META.open;
  const Icon = meta.icon;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={ticket.subject}
        icon={<LifeBuoy className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/app/tickets">
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </Link>
          </Button>
        }
      />

      {/* Foydalanuvchi xabari */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <p className="text-xs text-muted-foreground">{ticket.created_at ?? "—"}</p>
          <Badge variant={meta.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {t.has(ticket.status) ? t(ticket.status) : ticket.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.message || "—"}</p>
          {ticket.attachment && (
            <a
              href={ticket.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm transition-colors hover:border-blue-500/50"
            >
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              Biriktirilgan fayl
            </a>
          )}
        </CardContent>
      </Card>

      {/* Admin javobi */}
      {ticket.admin_reply ? (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Headset className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm">Support javobi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.admin_reply}</p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Javob kutilmoqda — support tez orada javob beradi.
        </p>
      )}
    </div>
  );
}
