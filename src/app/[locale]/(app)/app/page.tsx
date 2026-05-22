import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { readSession, userDisplayName } from "@/shared/auth/session";
import { ProjectsAPI, BillingAPI } from "@/shared/api/services";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { RecentBots } from "@/features/dashboard/components/recent-bots";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/routing";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const session = await readSession();
  const name = userDisplayName(session?.user);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("welcome", { name })}
          </h1>
          <p className="text-sm text-muted-foreground">{t("overview")}</p>
        </div>
        <Button asChild>
          <Link href="/app/templates" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {t("browseTemplates")}
          </Link>
        </Button>
      </header>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats t={t} />
      </Suspense>

      <Suspense fallback={<BotsSkeleton />}>
        <Bots t={t} />
      </Suspense>
    </div>
  );
}

async function Stats({ t }: { t: Awaited<ReturnType<typeof getTranslations<"dashboard">>> }) {
  let totalBots = 0;
  let activeBots = 0;
  let balance = 0;
  let currency = "UZS";

  try {
    const [bots, bal] = await Promise.all([
      ProjectsAPI.list().catch(() => []),
      BillingAPI.balance().catch(() => ({ balance: 0, currency: "UZS" })),
    ]);
    totalBots = bots.length;
    activeBots = bots.filter((b) => b.status === "active").length;
    balance = bal.balance ?? 0;
    currency = bal.currency ?? "UZS";
  } catch {
    // backend unreachable — show zeros
  }

  return (
    <StatsCards
      totalBots={totalBots}
      activeBots={activeBots}
      totalMessages={0}
      balance={balance}
      currency={currency}
      labels={{
        totalBots: t("totalBots"),
        activeBots: t("activeBots"),
        totalMessages: t("totalMessages"),
        balance: t("balance"),
      }}
    />
  );
}

async function Bots({ t }: { t: Awaited<ReturnType<typeof getTranslations<"dashboard">>> }) {
  let bots: Awaited<ReturnType<typeof ProjectsAPI.list>> = [];
  try {
    bots = await ProjectsAPI.list();
  } catch {}
  return (
    <RecentBots
      bots={bots}
      labels={{
        title: t("recentBots"),
        empty: t("noBots"),
        createFirst: t("createFirst"),
        createBot: t("createBot"),
      }}
    />
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}

function BotsSkeleton() {
  return <Skeleton className="h-64" />;
}
