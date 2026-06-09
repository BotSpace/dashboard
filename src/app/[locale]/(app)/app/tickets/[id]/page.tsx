import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Headset, LifeBuoy, Paperclip } from "lucide-react";
import { TicketsAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { TicketReplyForm } from "@/features/tickets/components/ticket-reply-form";

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
  const messages = ticket.messages ?? [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
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

      <div className="flex items-center gap-2">
        <Badge variant={meta.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {t.has(ticket.status) ? t(ticket.status) : ticket.status}
        </Badge>
        <span className="text-xs text-muted-foreground">{ticket.created_at ?? ""}</span>
      </div>

      {/* Suhbat */}
      <Card>
        <CardContent className="space-y-4 py-5">
          {messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Xabar yo&apos;q</p>
          ) : (
            messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[80%] space-y-1", isUser ? "items-end" : "items-start")}>
                    {!isUser && (
                      <span className="flex items-center gap-1 text-xs font-medium text-blue-500">
                        <Headset className="h-3 w-3" /> Support
                      </span>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? "rounded-br-sm bg-blue-600 text-white"
                          : "rounded-bl-sm bg-muted text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                      {m.attachment && (
                        <a
                          href={m.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs",
                            isUser ? "bg-white/15 hover:bg-white/25" : "bg-background hover:bg-muted-foreground/10"
                          )}
                        >
                          <Paperclip className="h-3.5 w-3.5" /> Fayl
                        </a>
                      )}
                    </div>
                    <span className="block px-1 text-[10px] text-muted-foreground">{m.created_at ?? ""}</span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Javob yozish */}
      {ticket.status === "closed" ? (
        <p className="text-center text-sm text-muted-foreground">
          Murojaat yopilgan. Yangi xabar yozsangiz qayta ochiladi.
        </p>
      ) : null}
      <Card>
        <CardContent className="py-4">
          <TicketReplyForm id={ticket.id} />
        </CardContent>
      </Card>
    </div>
  );
}
