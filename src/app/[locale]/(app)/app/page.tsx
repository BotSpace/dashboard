import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { ProjectsAPI, DashboardAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { StatCardsV2 } from "@/features/dashboard/components/stat-cards-v2";
import { BotPerformanceChart } from "@/features/dashboard/components/bot-performance-chart";
import { TopBotsList } from "@/features/dashboard/components/top-bots-list";
import { RecentBotsV2 } from "@/features/dashboard/components/recent-bots-v2";
import { QuickActions } from "@/features/dashboard/components/quick-actions";

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

  return (
    <div className="space-y-[22px] pb-8">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1
              className="text-[27px] font-semibold tracking-[-0.6px] leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("title")}
            </h1>
            {/* Active badge */}
            <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-1 text-[12px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_#22c55e]" />
              {t("active")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <Button
          asChild
          className="gap-2 rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_6px_20px_rgba(59,130,246,0.3)] hover:brightness-110 border-0 px-[17px] py-[11px] text-sm font-semibold"
        >
          <Link href="/app/bots/new">
            <Plus className="h-[18px] w-[18px]" />
            {t("newBot")}
          </Link>
        </Button>
      </header>

      {/* ── 1. Stat cards ──────────────────────────────── */}
      <StatCardsV2 totals={overview?.totals ?? null} />

      {/* ── 2. Bot faoliyati chart + Top botlar ────────── */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Bot faoliyati — keng */}
        <div className="min-w-0 rounded-[14px] border border-border/70 bg-card p-5">
          <div className="mb-[18px] flex items-center justify-between">
            <div>
              <h3
                className="text-base font-semibold leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("botPerformance")}
              </h3>
              <p className="mt-[3px] text-[12.5px] text-muted-foreground">
                {t("last30Days")}
              </p>
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-[7px] bg-blue-500/14 px-[11px] py-[5px] text-[12px] font-medium text-blue-300">
                {t("last30Days")}
              </span>
            </div>
          </div>
          <BotPerformanceChart data={overview?.performance ?? null} labels={chartLabels} />
        </div>

        {/* Top botlar — tor */}
        <div className="min-w-0 rounded-[14px] border border-border/70 bg-card p-5">
          <h3
            className="mb-4 text-base font-semibold leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("topBots")}
          </h3>
          <TopBotsList bots={overview?.top_bots ?? null} />
        </div>
      </div>

      {/* ── 3. So'nggi botlar + Tezkor harakatlar ──────── */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* So'nggi botlar */}
        <div className="min-w-0 rounded-[14px] border border-border/70 bg-card p-5">
          <div className="mb-[14px] flex items-center justify-between">
            <h3
              className="text-base font-semibold leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("recentBots")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-auto gap-1 px-0 text-[12.5px] font-medium text-primary hover:bg-transparent hover:text-primary/80"
            >
              <Link href="/app/bots">
                {t("all")}
                <span className="text-sm leading-none">›</span>
              </Link>
            </Button>
          </div>
          <Suspense fallback={<BotsSkeleton />}>
            <BotsSection />
          </Suspense>
        </div>

        {/* Tezkor harakatlar */}
        <div className="min-w-0 rounded-[14px] border border-border/70 bg-card p-5">
          <h3
            className="mb-[14px] text-base font-semibold leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("quickActions")}
          </h3>
          <QuickActions />
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
        <Skeleton key={i} className="h-[50px] w-full rounded-[9px]" />
      ))}
    </div>
  );
}
