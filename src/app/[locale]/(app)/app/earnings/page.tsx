import { getTranslations, setRequestLocale } from "next-intl/server";
import { Coins, TrendingUp, Wallet } from "lucide-react";
import { EarningsAPI } from "@/shared/api/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";
import { formatCurrency } from "@/shared/lib/utils";
import { TransactionsFilter } from "@/features/earnings/components/transactions-filter";
import type { EarningsSummary } from "@/shared/types/api";

const EMPTY: EarningsSummary = {
  balance: 0,
  withdrawable: "0",
  total_earned: "0",
  total_commission: "0",
  by_bot: [],
  orders: [],
};

export default async function EarningsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ bots?: string; status?: string; provider?: string; page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("earnings");

  const summary = await EarningsAPI.summary({
    project_in: sp.bots || undefined,
    status: sp.status || undefined,
    provider: sp.provider || undefined,
    page: sp.page ? Number(sp.page) : undefined,
  }).catch(() => EMPTY);

  const botOptions = summary.by_bot.map((b) => ({ id: String(b.project_id), name: b.project_name }));
  const selectedBots = (sp.bots ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} icon={<TrendingUp className="h-5 w-5" />} />

      {/* Umumiy ko'rsatkichlar */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" /> {t("withdrawable")}
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(Number(summary.withdrawable), "UZS", locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/app/withdraw">{t("withdraw")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> {t("totalEarned")}
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(Number(summary.total_earned), "UZS", locale)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5" /> {t("totalCommission")}
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(Number(summary.total_commission), "UZS", locale)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Bot bo'yicha taqsimot */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("byBot")}</h2>
        {summary.by_bot.length === 0 ? (
          <Card className="rounded-lg border-border bg-card shadow-none">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {t("noEarnings")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.by_bot.map((b) => (
              <Card key={b.project_id} className="rounded-lg border-border bg-card shadow-none">
                <CardHeader className="pb-2">
                  <CardDescription className="truncate">{b.project_name}</CardDescription>
                  <CardTitle className="text-xl">
                    {formatCurrency(Number(b.total_earned), "UZS", locale)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {b.count} {t("paymentsCount")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Transactionlar */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t("transactions")}</h2>
          <TransactionsFilter bots={botOptions} selected={selectedBots} />
        </div>
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardContent className="p-0">
            {summary.orders.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{t("noTransactions")}</p>
            ) : (
              <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("date")}</th>
                    <th className="px-4 py-3 text-left">{t("bot")}</th>
                    <th className="px-4 py-3 text-left">{t("payer")}</th>
                    <th className="px-4 py-3 text-right">{t("amount")}</th>
                    <th className="px-4 py-3 text-right">{t("net")}</th>
                    <th className="px-4 py-3 text-left">{t("provider")}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.orders.map((o) => {
                    const payerName = [o.payer_first_name, o.payer_last_name].filter(Boolean).join(" ");
                    return (
                      <tr key={o.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 text-muted-foreground">
                          <Link href={`/app/earnings/${o.id}`} className="block hover:text-foreground">
                            {o.paid_at ?? o.created_at ?? "—"}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{o.project_name ?? `#${o.project_id}`}</td>
                        <td className="px-4 py-3">
                          {payerName || (o.payer_username ? `@${o.payer_username}` : `#${o.payer_chat_id ?? "—"}`)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(Number(o.amount), "UZS", locale)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {formatCurrency(Number(o.net_amount), "UZS", locale)}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/app/earnings/${o.id}`}>
                            <Badge variant="secondary" className="uppercase">
                              {o.provider}
                            </Badge>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
