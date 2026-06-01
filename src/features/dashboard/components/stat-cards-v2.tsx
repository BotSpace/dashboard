import { Bot, Users, MessageSquare, DollarSign, LayoutTemplate } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { DashboardOverview } from "@/shared/types/api";

type Totals = DashboardOverview["totals"];

type LucideIcon = typeof Bot;

type StatItem = {
  label: string;
  value: string;
  delta: string | null;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function buildStats(totals: Totals): StatItem[] {
  return [
    {
      label: "Jami Botlar",
      value: String(totals.bots),
      delta: null,
      icon: Bot,
      gradient: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
    },
    {
      label: "Foydalanuvchilar",
      value: formatCompact(totals.users),
      delta: null,
      icon: Users,
      gradient: "from-indigo-500/20 to-indigo-600/5",
      iconColor: "text-indigo-400",
    },
    {
      label: "Xabarlar",
      value: formatCompact(totals.messages),
      delta: null,
      icon: MessageSquare,
      gradient: "from-fuchsia-500/20 to-fuchsia-600/5",
      iconColor: "text-fuchsia-400",
    },
    {
      label: "Balans",
      value: `${formatCompact(totals.revenue)} ${totals.currency}`,
      delta: null,
      icon: DollarSign,
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
    },
    {
      label: "Shablonlar",
      value: String(totals.templates),
      delta: null,
      icon: LayoutTemplate,
      gradient: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
    },
  ];
}

const ZERO_TOTALS: Totals = {
  bots: 0,
  active_bots: 0,
  users: 0,
  messages: 0,
  templates: 0,
  revenue: 0,
  currency: "UZS",
};

interface StatCardsV2Props {
  totals?: Totals | null;
}

export function StatCardsV2({ totals }: StatCardsV2Props) {
  const stats: StatItem[] = buildStats(totals ?? ZERO_TOTALS);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200",
            "hover:border-border hover:shadow-md",
          )}
        >
          {/* Subtle gradient background */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-60",
              stat.gradient,
            )}
          />

          <div className="relative">
            {/* Icon badge */}
            <div
              className={cn(
                "mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg",
                "border border-white/10 bg-white/5",
                stat.iconColor,
              )}
            >
              <stat.icon className="h-4 w-4" />
            </div>

            {/* Label */}
            <div className="text-xs text-muted-foreground">{stat.label}</div>

            {/* Value */}
            <div className="mt-0.5 text-2xl font-bold tracking-tight">
              {stat.value}
            </div>

            {stat.delta && (
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-[11px] font-medium text-emerald-400">
                  {stat.delta}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
