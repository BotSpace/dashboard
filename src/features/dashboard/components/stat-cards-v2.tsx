import { Bot, Users, MessageSquare, DollarSign, LayoutTemplate } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { DashboardOverview } from "@/shared/types/api";

type Totals = DashboardOverview["totals"];

type LucideIcon = typeof Bot;

type StatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
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

export interface StatCardLabels {
  totalBots: string;
  totalUsers: string;
  totalMessages: string;
  totalTemplates: string;
  balance: string;
}

interface StatCardsV2Props {
  totals?: Totals | null;
  labels: StatCardLabels;
}

export function StatCardsV2({ totals, labels }: StatCardsV2Props) {
  const t = totals ?? ZERO_TOTALS;

  const stats: StatItem[] = [
    {
      label: labels.totalBots,
      value: String(t.bots),
      icon: Bot,
      accent: "border-blue-500/30 bg-blue-500/5",
    },
    {
      label: labels.totalUsers,
      value: formatCompact(t.users),
      icon: Users,
      accent: "border-indigo-500/30 bg-indigo-500/5",
    },
    {
      label: labels.totalMessages,
      value: formatCompact(t.messages),
      icon: MessageSquare,
      accent: "border-fuchsia-500/30 bg-fuchsia-500/5",
    },
    {
      label: labels.balance,
      value: `${formatCompact(t.revenue)} ${t.currency}`,
      icon: DollarSign,
      accent: "border-emerald-500/30 bg-emerald-500/5",
    },
    {
      label: labels.totalTemplates,
      value: String(t.templates),
      icon: LayoutTemplate,
      accent: "border-amber-500/30 bg-amber-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "rounded-xl border bg-card p-4 shadow-sm transition-all duration-200",
            "hover:shadow-md",
            stat.accent,
          )}
        >
          {/* Icon + Label row */}
          <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <stat.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{stat.label}</span>
          </div>

          {/* Value */}
          <div className="text-2xl font-bold tracking-tight">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
