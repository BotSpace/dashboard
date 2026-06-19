import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bot, Plus, TrendingUp } from "lucide-react";
import { ProjectsAPI, DashboardAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { StatCardsV2 } from "@/features/dashboard/components/stat-cards-v2";
import { BotPerformanceChart } from "@/features/dashboard/components/bot-performance-chart";
import { TopBotsList } from "@/features/dashboard/components/top-bots-list";
import { RecentBotsV2 } from "@/features/dashboard/components/recent-bots-v2";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { AnalyticsDonut } from "@/features/dashboard/components/analytics-donut";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  // Fetch overview — null on any error; widgets show empty state
  const overview = await DashboardAPI.overview().catch(() => null);

  const chartLabels = {
    emptyTitle: t("chartEmptyTitle"),
    emptyDesc: t("chartEmptyDesc"),
    emptyCta: t("chartEmptyCta"),
    msgUnit: t("msgUnit"),
  };

  const statLabels = {
    totalBots: t("totalBots"),
    totalUsers: t("totalUsers"),
    totalMessages: t("totalMessages"),
    totalTemplates: t("totalTemplates"),
    balance: t("balance"),
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("title")}
              </h1>
              {/* Active badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {t("active")}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <Button asChild className="gap-2 shadow-lg shadow-blue-500/20">
          <Link href="/app/bots/new">
            <Plus className="h-4 w-4" />
            {t("newBot")}
          </Link>
        </Button>
      </header>

      {/* ── 1. Stat cards ──────────────────────────────── */}
      <StatCardsV2 totals={overview?.totals ?? null} labels={statLabels} />

      {/* ── 2. Performance chart + Top bots ───────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bot Performance — wide */}
        <div className="min-w-0 rounded-xl border border-border/60 bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="font-semibold">{t("botPerformance")}</span>
            </div>
            <span className="rounded-full border border-border/60 bg-muted/60 px-2.5 py-0.5 text-[11px] text-muted-foreground">
              {t("last30Days")}
            </span>
          </div>
          <BotPerformanceChart data={overview?.performance ?? null} labels={chartLabels} />
        </div>

        {/* Top bots — narrow */}
        <div className="min-w-0 rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-400" />
            <span className="font-semibold">{t("topBots")}</span>
          </div>
          <TopBotsList bots={overview?.top_bots ?? null} />
        </div>
      </div>

      {/* ── 3. Bottom row — 3 panels ───────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Bots */}
        <div className="min-w-0 rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold">{t("recentBots")}</span>
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/app/bots">{t("all")}</Link>
            </Button>
          </div>
          <Suspense fallback={<BotsSkeleton />}>
            <BotsSection />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <div className="min-w-0 rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-4">
            <span className="font-semibold">{t("quickActions")}</span>
          </div>
          <QuickActions />
        </div>

        {/* Analytics Donut */}
        <div className="min-w-0 rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="font-semibold">{t("analytics")}</span>
          </div>
          <AnalyticsDonut distribution={overview?.distribution ?? null} />
        </div>
      </div>
    </div>
  );
}

async function BotsSection() {
  let bots: Awaited<ReturnType<typeof ProjectsAPI.list>> = [];
  try {
    const paged = await ProjectsAPI.listPaged({ page: 1, page_size: 5 });
    bots = paged.results;
  } catch {
    // empty list shown as empty state inside component
  }
  return <RecentBotsV2 bots={bots} />;
}

function BotsSkeleton() {
  return (
    <div className="space-y-2.5">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}
