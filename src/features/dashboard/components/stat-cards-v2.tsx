import { Bot, Users, MessageSquare, DollarSign, LayoutTemplate } from "lucide-react";

import type { DashboardOverview } from "@/shared/types/api";

type Totals = DashboardOverview["totals"];

type LucideIcon = typeof Bot;

type StatItem = {
  label: string;
  value: string;
  delta: string | null;
  icon: LucideIcon;
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
    },
    {
      label: "Foydalanuvchilar",
      value: formatCompact(totals.users),
      delta: null,
      icon: Users,
    },
    {
      label: "Xabarlar",
      value: formatCompact(totals.messages),
      delta: null,
      icon: MessageSquare,
    },
    {
      label: "Balans",
      value: `${formatCompact(totals.revenue)} ${totals.currency}`,
      delta: null,
      icon: DollarSign,
    },
    {
      label: "Shablonlar",
      value: String(totals.templates),
      delta: null,
      icon: LayoutTemplate,
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
    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="min-w-0 border-border p-4 transition-colors hover:bg-accent/50 max-sm:odd:border-r sm:border-r sm:last:border-r-0"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-xs text-muted-foreground">{stat.label}</span>
            <stat.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </div>
          <div className="mt-2 truncate text-xl font-semibold tracking-tight tabular-nums">
            {stat.value}
          </div>
          {stat.delta && (
            <span className="mt-1 text-[11px] font-medium text-emerald-500">{stat.delta}</span>
          )}
          {index < 4 && <span className="sr-only">,</span>}
        </div>
      ))}
    </div>
  );
}
