import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Activity, Bot, Clock3, Plus } from "lucide-react";
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

  const overview = await DashboardAPI.overview().catch(() => null);

  const chartLabels = {
    emptyTitle: t("chartEmptyTitle"),
    emptyDesc: t("chartEmptyDesc"),
    emptyCta: t("chartEmptyCta"),
    msgUnit: t("msgUnit"),
  };

  return (
    <div className="mx-auto w-full max-w-350 space-y-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/app/bots/new?src=dashboard-header">
            <Plus className="h-4 w-4" />
            {t("newBot")}
          </Link>
        </Button>
      </header>

      <StatCardsV2 totals={overview?.totals ?? null} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="dashboard-panel min-w-0 overflow-hidden">
          <div className="dashboard-panel-header">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-muted-foreground" />
              {t("botPerformance")}
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {t("last30Days")}
            </span>
          </div>
          <div className="p-4">
            <BotPerformanceChart data={overview?.performance ?? null} labels={chartLabels} />
          </div>
        </div>

        <div className="dashboard-panel min-w-0 overflow-hidden">
          <div className="dashboard-panel-header">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bot className="h-4 w-4 text-muted-foreground" />
              {t("topBots")}
            </div>
          </div>
          <div className="p-4">
            <TopBotsList bots={overview?.top_bots ?? null} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="dashboard-panel min-w-0 overflow-hidden">
          <div className="dashboard-panel-header">
            <span className="text-sm font-medium">{t("recentBots")}</span>
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs text-muted-foreground">
              <Link href="/app/bots">{t("all")}</Link>
            </Button>
          </div>
          <div className="p-3">
            <Suspense fallback={<BotsSkeleton />}>
              <BotsSection />
            </Suspense>
          </div>
        </div>

        <div className="dashboard-panel min-w-0 overflow-hidden">
          <div className="dashboard-panel-header">
            <span className="text-sm font-medium">{t("quickActions")}</span>
          </div>
          <div className="p-3">
            <QuickActions />
          </div>
        </div>

        <div className="dashboard-panel min-w-0 overflow-hidden lg:col-span-2 xl:col-span-1">
          <div className="dashboard-panel-header">
            <span className="text-sm font-medium">{t("analytics")}</span>
          </div>
          <div className="p-4">
            <AnalyticsDonut distribution={overview?.distribution ?? null} />
          </div>
        </div>
      </section>
    </div>
  );
}

async function BotsSection() {
  let bots: Awaited<ReturnType<typeof ProjectsAPI.list>> = [];
  try {
    const paged = await ProjectsAPI.listPaged({ page: 1, page_size: 5 });
    bots = paged.results;
  } catch {
    // The component renders its own empty state.
  }
  return <RecentBotsV2 bots={bots} />;
}

function BotsSkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}
