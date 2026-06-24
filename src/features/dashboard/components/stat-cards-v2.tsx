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
  iconBg: string;
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
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      label: "Foydalanuvchilar",
      value: formatCompact(totals.users),
      delta: null,
      icon: Users,
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-400",
    },
    {
      label: "Xabarlar",
      value: formatCompact(totals.messages),
      delta: null,
      icon: MessageSquare,
      iconBg: "bg-fuchsia-500/10",
      iconColor: "text-fuchsia-400",
    },
    {
      label: "Balans",
      value: `${formatCompact(totals.revenue)} ${totals.currency}`,
      delta: null,
      icon: DollarSign,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      label: "Shablonlar",
      value: String(totals.templates),
      delta: null,
      icon: LayoutTemplate,
      iconBg: "bg-amber-500/10",
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
    <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "group rounded-[13px] border border-border/70 bg-card/70 p-4",
            "transition-all duration-[180ms]",
            "hover:border-blue-500/30 hover:bg-blue-500/4",
          )}
        >
          {/* Top row: icon + delta */}
          <div className="mb-[14px] flex items-center justify-between">
            <span
              className={cn(
                "flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-[18px]",
                stat.iconBg,
                stat.iconColor,
              )}
            >
              <stat.icon className="h-[18px] w-[18px]" />
            </span>
            {stat.delta && (
              <span className="text-[11.5px] font-semibold text-emerald-400">
                {stat.delta}
              </span>
            )}
          </div>

          {/* Value */}
          <div
            className="text-[23px] font-semibold tracking-[-0.5px] text-foreground leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {stat.value}
          </div>

          {/* Label */}
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
