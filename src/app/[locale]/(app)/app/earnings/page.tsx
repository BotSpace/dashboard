import { getTranslations, setRequestLocale } from "next-intl/server";
import { Coins, TrendingUp, Wallet, ArrowDownToLine, Bot } from "lucide-react";
import { EarningsAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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

// Bar grafik uchun ranglar
function barColor(idx: number): string {
  const colors = [
    "bg-emerald-500",
    "bg-emerald-400",
    "bg-green-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];
  return colors[idx % colors.length];
}

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

  // Bar grafik uchun by_bot ma'lumotlarini normalizatsiya
  const maxBotEarning = summary.by_bot.length > 0
    ? Math.max(...summary.by_bot.map((b) => Number(b.total_earned)))
    : 0;

  // So'nggi tranzaksiyalar — faqat 5 ta
  const recentOrders = summary.orders.slice(0, 5);

  const statCards = [
    {
      key: "withdrawable",
      label: t("withdrawable"),
      value: formatCurrency(Number(summary.withdrawable), "UZS", locale),
      icon: <Wallet className="h-4 w-4" />,
      accent: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      key: "totalEarned",
      label: t("totalEarned"),
      value: formatCurrency(Number(summary.total_earned), "UZS", locale),
      icon: <TrendingUp className="h-4 w-4" />,
      accent: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      key: "totalCommission",
      label: t("totalCommission"),
      value: formatCurrency(Number(summary.total_commission), "UZS", locale),
      icon: <Coins className="h-4 w-4" />,
      accent: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      key: "balance",
      label: t("balance"),
      value: formatCurrency(Number(summary.balance), "UZS", locale),
      icon: <ArrowDownToLine className="h-4 w-4" />,
      accent: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="px-6 py-7 max-w-[1240px] space-y-5">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[27px] font-semibold tracking-[-0.6px] leading-none mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("byBot")}</p>
        </div>
        <Button
          asChild
          className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold hover:brightness-110 border-0 rounded-[10px] px-[17px] py-[11px] h-auto"
        >
          <Link href="/app/withdraw">
            <Wallet className="h-[17px] w-[17px]" />
            {t("withdraw")}
          </Link>
        </Button>
      </div>

      {/* ===== STAT KARTALAR (4 ta) ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
        {statCards.map((s) => (
          <div
            key={s.key}
            className="bg-white/[0.025] border border-white/[0.07] rounded-[13px] p-4"
          >
            <div className="flex items-center justify-between mb-[14px]">
              <span
                className={`flex items-center justify-center w-[34px] h-[34px] rounded-[9px] ${s.iconBg} ${s.accent}`}
              >
                {s.icon}
              </span>
              <span className={`text-[11.5px] font-semibold ${s.accent}`}>
                &mdash;
              </span>
            </div>
            <div
              className="text-[23px] font-semibold tracking-[-0.5px] leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </div>
            <div className="text-[12.5px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ===== PASTKI 2 USTUN: Bar grafik + So'nggi tranzaksiyalar ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        {/* Bar grafik — botlar bo'yicha daromad */}
        <div className="bg-white/[0.025] border border-white/[0.07] rounded-[14px] p-5">
          <h3
            className="text-base font-semibold mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("byBot")}
          </h3>
          {summary.by_bot.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
              {t("noEarnings")}
            </div>
          ) : (
            <div className="flex items-end gap-2 h-[180px]">
              {summary.by_bot.map((b, idx) => {
                const heightPct = maxBotEarning > 0
                  ? Math.max(4, Math.round((Number(b.total_earned) / maxBotEarning) * 100))
                  : 4;
                return (
                  <div
                    key={b.project_id}
                    className="flex-1 flex flex-col justify-end h-full group relative"
                    title={`${b.project_name}: ${formatCurrency(Number(b.total_earned), "UZS", locale)}`}
                  >
                    <div
                      className={`w-full rounded-t-[5px] transition-all duration-200 ${barColor(idx)}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-popover border border-border rounded-md px-2 py-1 text-[11px] whitespace-nowrap shadow-md">
                        <span className="font-medium text-foreground">{b.project_name}</span>
                        <br />
                        <span className="text-muted-foreground">{formatCurrency(Number(b.total_earned), "UZS", locale)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* So'nggi tranzaksiyalar */}
        <div className="bg-white/[0.025] border border-white/[0.07] rounded-[14px] p-5">
          <h3
            className="text-base font-semibold mb-[14px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("transactions")}
          </h3>
          {recentOrders.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
              {t("noTransactions")}
            </div>
          ) : (
            <div className="flex flex-col">
              {recentOrders.map((o) => {
                const payerName = [o.payer_first_name, o.payer_last_name]
                  .filter(Boolean)
                  .join(" ");
                const displayName =
                  payerName ||
                  (o.payer_username ? `@${o.payer_username}` : `#${o.payer_chat_id ?? "—"}`);
                return (
                  <div
                    key={o.id}
                    className="flex items-center gap-3 py-[11px] border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-foreground/90 truncate">
                        {displayName}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {o.paid_at ?? o.created_at ?? "—"}
                      </div>
                    </div>
                    <Link href={`/app/earnings/${o.id}`}>
                      <span
                        className="text-[13.5px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        +{formatCurrency(Number(o.net_amount), "UZS", locale)}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== TO'LIQ TRANZAKSIYALAR JADVALI ===== */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            className="text-base font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("transactions")}
          </h2>
          <TransactionsFilter bots={botOptions} selected={selectedBots} />
        </div>
        <div className="bg-white/[0.025] border border-white/[0.07] rounded-[14px] overflow-hidden">
          {summary.orders.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("noTransactions")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="border-b border-white/[0.07] bg-white/[0.02] text-xs uppercase text-muted-foreground">
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
                    const payerName = [o.payer_first_name, o.payer_last_name]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <tr
                        key={o.id}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          <Link
                            href={`/app/earnings/${o.id}`}
                            className="hover:text-foreground transition-colors"
                          >
                            {o.paid_at ?? o.created_at ?? "—"}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5">
                            <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {o.project_name ?? `#${o.project_id}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {payerName ||
                            (o.payer_username
                              ? `@${o.payer_username}`
                              : `#${o.payer_chat_id ?? "—"}`)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(Number(o.amount), "UZS", locale)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-400"
                          style={{ fontFamily: "var(--font-display)" }}>
                          +{formatCurrency(Number(o.net_amount), "UZS", locale)}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/app/earnings/${o.id}`}>
                            <Badge
                              variant="secondary"
                              className="uppercase text-[11px] border border-white/[0.07]"
                            >
                              {o.provider}
                            </Badge>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
