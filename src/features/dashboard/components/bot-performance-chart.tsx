"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Plus } from "lucide-react";
import { Link } from "@/shared/i18n/routing";

function formatY(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

// Uzbek month names — toLocaleString("uz") is unreliable across runtimes
// (produced junk like "M06"), so map explicitly.
const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

/** "2026-06-06" → "6-iyun" */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`;
}

interface BotPerformanceChartProps {
  /** Backend performance points: {date: "YYYY-MM-DD", value: number}[]. */
  data?: { date: string; value: number }[] | null;
  labels: {
    emptyTitle: string;
    emptyDesc: string;
    emptyCta: string;
    msgUnit: string;
  };
}

export function BotPerformanceChart({ data, labels }: BotPerformanceChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-xl">
        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          {formatY(payload[0].value)} {labels.msgUnit}
        </p>
      </div>
    );
  }

  const points =
    data && data.length > 0
      ? data.map((p) => ({ day: formatDate(p.date), messages: p.value }))
      : [];
  // Treat an all-zero series the same as no data — a flat line on a 0–1
  // axis is meaningless and confused users.
  const hasSignal = points.some((p) => p.messages > 0);
  const chartData = hasSignal ? points : [];

  if (chartData.length === 0) {
    return (
      <div className="flex h-55 flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{labels.emptyTitle}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{labels.emptyDesc}</p>
        </div>
        <Link
          href="/app/bots/new?src=chart-empty"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" />
          {labels.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ededed" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#ededed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.08)"
          vertical={false}
        />
        <XAxis
          dataKey="day"
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis
          tickFormatter={formatY}
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "rgba(255,255,255,0.22)", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="messages"
          stroke="#ededed"
          strokeWidth={2}
          fill="url(#perfGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#000", stroke: "#ededed", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
