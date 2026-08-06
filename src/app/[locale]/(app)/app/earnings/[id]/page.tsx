import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt, User } from "lucide-react";
import { EarningsAPI } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";
import { formatCurrency } from "@/shared/lib/utils";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

export default async function EarningOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const order = await EarningsAPI.detail(id).catch(() => null);
  if (!order) notFound();

  const payerName = [order.payer_first_name, order.payer_last_name].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <PageHeader
        title={`To'lov #${order.id}`}
        icon={<Receipt className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/app/earnings">
              <ArrowLeft className="h-4 w-4" /> Daromadlarga qaytish
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* To'lovchi ma'lumotlari */}
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4 text-muted-foreground" /> To&apos;lovchi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Row label="Ism" value={order.payer_first_name} />
            <Row label="Familiya" value={order.payer_last_name} />
            <Row
              label="Username"
              value={order.payer_username ? `@${order.payer_username}` : null}
            />
            <Row label="Chat ID" value={order.payer_chat_id ? String(order.payer_chat_id) : null} />
            <Row label="To'liq ism" value={payerName} />
          </CardContent>
        </Card>

        {/* To'lov ma'lumotlari */}
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-4 w-4 text-muted-foreground" /> To&apos;lov
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Row label="Bot" value={order.project_name ?? `#${order.project_id}`} />
            <Row label="Summa" value={formatCurrency(Number(order.amount), "UZS", locale)} />
            <Row label="Komissiya" value={formatCurrency(Number(order.commission), "UZS", locale)} />
            <Row
              label="Sof daromad"
              value={
                <span className="text-foreground">
                  {formatCurrency(Number(order.net_amount), "UZS", locale)}
                </span>
              }
            />
            <Row label="To'lov turi" value={<Badge variant="secondary" className="uppercase">{order.provider}</Badge>} />
            <Row label="Holat" value={<Badge variant="secondary">{order.status}</Badge>} />
            <Row label="Tranzaksiya ID" value={order.external_id} />
            <Row label="Izoh" value={order.comment} />
            <Row label="Yaratilgan" value={order.created_at} />
            <Row label="To'langan" value={order.paid_at} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
